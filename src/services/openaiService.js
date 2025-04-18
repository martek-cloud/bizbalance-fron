import Cookies from 'js-cookie';
import authStore from '@/store/authStore';

// Constants
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const OPENAI_API_URL = 'https://api.openai.com/v1';
const ASSISTANT_ID = import.meta.env.VITE_OPENAI_ASSISTANT_ID;

/**
 * Service for interacting with the OpenAI API
 */

/**
 * Send a message to the OpenAI API and get a response
 * @param {string} message - The user's message
 * @param {Array} conversationHistory - The conversation history
 * @returns {Promise<string>} - The AI's response
 */
export const sendMessageToOpenAI = async (message, conversationHistory = []) => {
  try {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          ...conversationHistory,
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to get response from OpenAI");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error in sendMessageToOpenAI:", error);
    throw error;
  }
};

/**
 * Send a message to the OpenAI API and get a streaming response
 * @param {string} message - The user's message
 * @param {Array} conversationHistory - The conversation history
 * @param {Function} onChunk - Callback function to handle each chunk of the response
 * @param {Array} functions - Optional array of function definitions for function calling
 * @param {Function} function_call_handler - Optional callback to handle function calls
 * @returns {Promise<void>} - Resolves when the stream is complete
 */
export const streamMessageFromOpenAI = async (
  message,
  conversationHistory = [],
  onChunk,
  functions = null,
  function_call_handler = null
) => {
  try {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }

    // Prepare the request body
    const requestBody = {
      model: "gpt-4o",
      messages: [
        ...conversationHistory,
        { role: "user", content: message }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    };

    // Add functions if provided
    if (functions) {
      requestBody.functions = functions;
      requestBody.function_call = "auto";
    }

    // Make the API request
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to get response from OpenAI");
    }

    // Get the reader from the response stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let functionCallData = null;
    let isCollectingFunctionCall = false;

    // Process the stream
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      // Decode the chunk and add it to the buffer
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Process complete lines from the buffer
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

      for (const line of lines) {
        if (line.trim() === "") continue;
        if (line.trim() === "data: [DONE]") continue;

        // Remove the "data: " prefix
        const jsonStr = line.replace(/^data: /, "").trim();
        
        try {
          const data = JSON.parse(jsonStr);
          
          // Check if this is a function call
          if (data.choices && data.choices[0].delta.function_call) {
            isCollectingFunctionCall = true;
            
            // Initialize function call data if needed
            if (!functionCallData) {
              functionCallData = {
                name: "",
                arguments: ""
              };
            }
            
            // Collect function call data
            const delta = data.choices[0].delta.function_call;
            if (delta.name) functionCallData.name += delta.name;
            if (delta.arguments) functionCallData.arguments += delta.arguments;
          } 
          // If we were collecting a function call and now we're not, process it
          else if (isCollectingFunctionCall) {
            isCollectingFunctionCall = false;
            
            // Process the function call
            if (functionCallData && function_call_handler) {
              try {
                // Parse the arguments
                const args = JSON.parse(functionCallData.arguments);
                
                // Call the handler
                const result = await function_call_handler(functionCallData.name, args);
                
                // Instead of making a follow-up request, just return the result
                // This prevents page reloads that might be happening during the follow-up request
                onChunk(`\n\nFunction call to ${functionCallData.name} completed. Result: ${JSON.stringify(result)}\n\n`);
                
                // Reset function call data
                functionCallData = null;
                return; // Exit the main stream processing
              } catch (error) {
                console.error("Error handling function call:", error);
                onChunk("I encountered an error while processing your request. Please try again.");
                return;
              }
            }
          }
          // Normal content streaming
          else if (data.choices && data.choices[0].delta.content) {
            onChunk(data.choices[0].delta.content);
          }
        } catch (e) {
          console.error("Error parsing JSON:", e);
        }
      }
    }
  } catch (error) {
    console.error("Error in streamMessageFromOpenAI:", error);
    throw error;
  }
};

/**
 * Check if the OpenAI API key is valid
 * @returns {Promise<boolean>} - Whether the API key is valid
 */
export const validateApiKey = async () => {
  try {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      return false;
    }

    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error validating API key:", error);
    return false;
  }
};

// Function to get or create an assistant
export const getOrCreateAssistant = async (functions = null) => {
  try {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }

    // Check if we have an assistant ID stored
    let assistantId = localStorage.getItem("openai_assistant_id");
    
    // If we have an assistant ID, verify it still exists
    if (assistantId) {
      try {
        const response = await fetch(`https://api.openai.com/v2/assistants/${assistantId}`, {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "OpenAI-Beta": "assistants=v2"
          }
        });
        
        if (response.ok) {
          // Assistant exists, return its ID
          return assistantId;
        }
      } catch (error) {
        console.warn("Error verifying assistant:", error);
        // Continue to create a new assistant
      }
    }
    
    // Create a new assistant
    const createResponse = await fetch("https://api.openai.com/v2/assistants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({
        name: "Financial Assistant",
        instructions: "You are a helpful financial assistant that helps users manage their expenses, income, and optimize their taxes. You have access to their financial data and can provide personalized advice.",
        model: "gpt-4o",
        tools: functions ? functions.map(func => ({
          type: "function",
          function: {
            name: func.name,
            description: func.description,
            parameters: func.parameters
          }
        })) : []
      })
    });
    
    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(errorData.error?.message || "Failed to create assistant");
    }
    
    const assistantData = await createResponse.json();
    assistantId = assistantData.id;
    
    // Store the assistant ID for future use
    localStorage.setItem("openai_assistant_id", assistantId);
    
    return assistantId;
  } catch (error) {
    console.error("Error in getOrCreateAssistant:", error);
    throw error;
  }
};

// Function to create a thread
export const createThread = async () => {
  try {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }
    
    const response = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to create thread");
    }
    
    const threadData = await response.json();
    return threadData.id;
  } catch (error) {
    console.error("Error in createThread:", error);
    throw error;
  }
};

// Function to add a message to a thread
export const addMessageToThread = async (threadId, message) => {
  try {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }
    
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({
        role: "user",
        content: message
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to add message to thread");
    }
    
    const messageData = await response.json();
    return messageData.id;
  } catch (error) {
    console.error("Error in addMessageToThread:", error);
    throw error;
  }
};

// Function to run the assistant on a thread
export const runAssistant = async (threadId, assistantId, onChunk, function_call_handler = null, functions = null) => {
  try {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }
    
    // Start a run
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        tools: functions ? functions.map(func => ({
          type: "function",
          function: {
            name: func.name,
            description: func.description,
            parameters: func.parameters
          }
        })) : []
      })
    });
    
    if (!runResponse.ok) {
      const errorData = await runResponse.json();
      throw new Error(errorData.error?.message || "Failed to run assistant");
    }
    
    const runData = await runResponse.json();
    const runId = runData.id;
    
    // Poll for run completion
    let runStatus = "queued";
    let runDetails;
    
    while (runStatus === "queued" || runStatus === "in_progress") {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between polls
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "OpenAI-Beta": "assistants=v2"
        }
      });
      
      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        throw new Error(errorData.error?.message || "Failed to get run status");
      }
      
      runDetails = await statusResponse.json();
      runStatus = runDetails.status;
      
      // Handle function calls if needed
      if (runStatus === "requires_action" && function_call_handler) {
        const toolCalls = runDetails.required_action.submit_tool_outputs.tool_calls;
        const toolOutputs = [];
        
        for (const toolCall of toolCalls) {
          if (toolCall.type === "function") {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            
            // Call the function handler
            const result = await function_call_handler(functionName, functionArgs);
            
            toolOutputs.push({
              tool_call_id: toolCall.id,
              output: JSON.stringify(result)
            });
          }
        }
        
        // Submit the tool outputs
        const submitResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}/submit_tool_outputs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "OpenAI-Beta": "assistants=v2"
          },
          body: JSON.stringify({
            tool_outputs: toolOutputs
          })
        });
        
        if (!submitResponse.ok) {
          const errorData = await submitResponse.json();
          throw new Error(errorData.error?.message || "Failed to submit tool outputs");
        }
        
        // Continue polling
        runStatus = "queued";
      }
    }
    
    // Check if the run completed successfully
    if (runStatus !== "completed") {
      throw new Error(`Run failed with status: ${runStatus}`);
    }
    
    // Get the messages from the thread
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v2"
      }
    });
    
    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json();
      throw new Error(errorData.error?.message || "Failed to get messages");
    }
    
    const messagesData = await messagesResponse.json();
    const assistantMessage = messagesData.data[0];
    
    // Stream the content
    if (assistantMessage.content && assistantMessage.content.length > 0) {
      for (const contentItem of assistantMessage.content) {
        if (contentItem.type === "text") {
          // Simulate streaming by sending chunks of the text
          const text = contentItem.text.value;
          const chunks = text.match(/.{1,5}/g) || [text];
          
          for (const chunk of chunks) {
            onChunk(chunk);
            await new Promise(resolve => setTimeout(resolve, 20)); // Small delay for streaming effect
          }
        }
      }
    }
    
    return assistantMessage;
  } catch (error) {
    console.error("Error in runAssistant:", error);
    throw error;
  }
};

// Function to cancel a specific run
export const cancelRun = async (threadId, runId) => {
  try {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }
    
    console.log(`Cancelling run: ${runId} on thread: ${threadId}`);
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}/cancel`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v2"
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to cancel run");
    }
    
    return true;
  } catch (error) {
    console.error("Error in cancelRun:", error);
    throw error;
  }
};

// Helper function to get authentication token
export const getAuthToken = () => {
  // First try to get from auth store
  const authState = authStore.getState();
  if (authState.token) {
    return authState.token;
  }
  
  // Then try localStorage
  const localToken = localStorage.getItem('token');
  if (localToken) {
    return localToken;
  }
  
  // Then try session storage
  const sessionToken = sessionStorage.getItem('session_token');
  if (sessionToken) {
    return sessionToken;
  }
  
  // Finally try cookies
  const cookieToken = Cookies.get('auth_token') || Cookies.get('token');
  if (cookieToken) {
    return cookieToken;
  }
  
  throw new Error('Authentication required');
};

// Update the getUserThreads function
export const getUserThreads = async () => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/api/threads`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
      },
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication required');
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch threads');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching threads:', error);
    throw error;
  }
};

// Update the createNewThread function
export const createNewThread = async (name) => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/api/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
      },
      credentials: 'include',
      body: JSON.stringify({ name })
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication required');
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to create thread');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
};

// Update the deleteThread function
export const deleteThread = async (threadId) => {
  try {
    // Get authentication token using the helper function
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Make the API request to delete the thread
    const response = await fetch(`${API_URL}/api/threads/${threadId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
      },
      credentials: 'include'
    });

    // Check if the response is successful
    if (!response.ok) {
      // Handle different error cases
      if (response.status === 401) {
        throw new Error('Authentication required');
      } else if (response.status === 403) {
        throw new Error('Not authorized to delete this thread');
      } else if (response.status === 404) {
        throw new Error('Thread not found');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete thread');
      }
    }

    // Return success
    return true;
  } catch (error) {
    console.error('Error deleting thread:', error);
    throw error;
  }
};

// Update the setActiveThread function
export const setActiveThread = async (threadId) => {
  try {
    const token = getAuthToken();
    
    // Get the current user ID from the auth store
    const user = authStore.getState().user;
    
    if (!user || !user.id) {
      throw new Error('User ID not found');
    }
    
    // Convert threadId to string if it's not already a string
    const threadIdString = String(threadId);

    // Update user's active thread in the database
    const response = await fetch(`${API_URL}/api/users/${user.id}/activeThread`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
      },
      credentials: 'include',
      body: JSON.stringify({ threadId: threadIdString })
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication required');
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to set active thread');
    }

    const data = await response.json();
    
    // Store the active thread ID in localStorage
    localStorage.setItem('activeThreadId', threadIdString);
    
    return data;
  } catch (error) {
    console.error('Error setting active thread:', error);
    throw error;
  }
};

// Update the getActiveThread function
export const getActiveThread = async (userId) => {
  try {
    const token = getAuthToken();

    // Get user's active thread from the database
    const response = await fetch(`${API_URL}/api/users/${userId}/activeThread`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication required');
      }
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to get active thread");
    }
    
    const data = await response.json();
    
    // Ensure threadId is a string
    const threadId = data.thread_id ? String(data.thread_id) : null;
    
    // Store the active thread ID in localStorage if it exists
    if (threadId) {
      localStorage.setItem('activeThreadId', threadId);
    }
    
    return threadId;
  } catch (error) {
    console.error("Error in getActiveThread:", error);
    throw error;
  }
};

// Update the renameThread function
export const renameThread = async (threadId, newName) => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_URL}/api/threads/${threadId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
      },
      credentials: 'include',
      body: JSON.stringify({ name: newName })
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication required');
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to rename thread');
    }

    return await response.json();
  } catch (error) {
    console.error('Error renaming thread:', error);
    throw error;
  }
};

// Function to send a message using the Assistants API
export const sendMessageWithAssistant = async (message, onChunk, functionHandler) => {
  try {
    // Check if user is authenticated
    const user = authStore.getState().user;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get authentication token
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    // Get the active thread ID
    const activeThreadId = localStorage.getItem('activeThreadId');
    if (!activeThreadId) {
      throw new Error("No active thread found");
    }

    // Send message to backend API
    const response = await fetch(`${API_URL}/api/threads/${activeThreadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
      },
      credentials: 'include',
      body: JSON.stringify({
        message,
        functionHandler: functionHandler ? true : false
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      } else if (response.status === 403) {
        throw new Error('Not authorized to send messages in this thread');
      } else if (response.status === 404) {
        throw new Error('Thread not found');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        try {
          const data = JSON.parse(line);
          if (data.type === 'chunk') {
            onChunk(data.content);
          } else if (data.type === 'function_call' && functionHandler) {
            const result = await functionHandler(data.name, data.arguments);
            // Send function result back to backend
            await fetch(`${API_URL}/api/threads/${activeThreadId}/function-result`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
              },
              credentials: 'include',
              body: JSON.stringify({
                functionName: data.name,
                result
              })
            });
          }
        } catch (error) {
          console.error('Error processing stream data:', error);
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error in sendMessageWithAssistant:", error);
    throw error;
  }
};

// Function to get thread messages
export const getThreadMessages = async (threadId) => {
  try {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      throw new Error("OpenAI API key not found");
    }

    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v2"
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to get thread messages");
    }

    const messagesData = await response.json();
    // Reverse the array to get chronological order (oldest first)
    return messagesData.data
      .map(message => ({
        role: message.role,
        content: message.content[0]?.text?.value || ''
      }))
      .reverse(); // Reverse the array to get chronological order
  } catch (error) {
    console.error("Error in getThreadMessages:", error);
    throw error;
  }
}; 