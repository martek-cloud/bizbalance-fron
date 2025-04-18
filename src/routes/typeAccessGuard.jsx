// routes/typeAccessGuard.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useExpenseTypeStore from '@/store/typeStore';
import authStore from '@/store/authStore';

export const canAccessType = (type) => {
  const user = authStore.getState().user;
  
  console.log('Access Check:', {
    user: {
      id: user?.id,
      role: user?.role_type,
      comptableKey: user?.comptable_key,
      refKey: user?.comptable_reference_key
    },
    type: {
      id: type?.id,
      createdBy: type?.created_by,
      creator: {
        role: type?.creator?.role_type,
        comptableKey: type?.creator?.comptable_key,
        refKey: type?.creator?.comptable_reference_key
      }
    }
  });

  if (!user || !type?.creator) {
    console.log('Access denied: Missing user or type creator');
    return false;
  }
  
  if (user.role_type === 'admin') {
    console.log('Access granted: Admin user');
    return true;
  }

  const isOwner = type.created_by == user.id;

  const isAdminType = type.creator.role_type === 'admin';
  
  if (user.role_type === 'comptable') {
    const hasUserAccess = type.creator.role_type === 'user' && 
                         type.creator.comptable_reference_key === user.comptable_key;
    
    console.log('Accountant access check:', { isOwner, isAdminType, hasUserAccess });
    return isOwner || isAdminType || hasUserAccess;
  }
  
  if (user.role_type === 'user') {
    const hasComptableAccess = type.creator.role_type === 'comptable' && 
                              type.creator.comptable_key === user.comptable_reference_key;
    
    console.log('User access check:', { isOwner, isAdminType, hasComptableAccess });
    return isOwner || isAdminType || hasComptableAccess;
  }
  
  return false;
};

export const useTypeGuard = (typeId) => {
  const navigate = useNavigate();
  const { fetchTypeById } = useExpenseTypeStore();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const type = await fetchTypeById(typeId);
        console.log('Fetched type:', type);
        
        const hasAccess = canAccessType(type);
        console.log('Access result:', hasAccess);
        
        if (!type || !hasAccess) {
          navigate('/unauthorized');
        }
      } catch (error) {
        console.error('Type guard error:', error);
        navigate('/unauthorized');
      }
    };
    
    checkAccess();
  }, [typeId]);
};

export default useTypeGuard;