import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TypeFormSchema } from "./validationSchemas";
import Steps from "./Steps";
import SelectRange from "./SelectRange";
import TypeInfo from "./TypeInfo";
import Confirm from "./Confirm";
import { Form } from "@/components/ui/form";
import useExpenseTypeStore from "@/store/typeStore";

export default function AddType({ onClose, editData, isEditing }) {
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addType, updateType } = useExpenseTypeStore();

    const form = useForm({
        resolver: zodResolver(TypeFormSchema),
        defaultValues: {
            range: "",
            name: "",
            description: "",
        },
        mode: "onChange",
    });

    // Set form values when editing
    useEffect(() => {
        if (isEditing && editData) {
            form.reset({
                range: editData.range,
                name: editData.name,
                description: editData.description,
            });
        } else {
            // Reset form when not editing
            form.reset({
                range: "",
                name: "",
                description: "",
            });
        }
    }, [editData, form, isEditing]);

    const nextStep = () => setStep(step + 1);
    const previousStep = () => setStep(step - 1);

    const handleClose = () => {
        form.reset({
            range: "",
            name: "",
            description: "",
        });
        setStep(0);
        onClose();
    };

    const onSubmit = async (values) => {
        try {
            setIsSubmitting(true);
            const isValid = await form.trigger();
            if (isValid) {
                let success;

                if (isEditing) {
                    success = await updateType(editData.id, values);
                } else {
                    success = await addType(values);
                }

                if (success) {
                    handleClose(); // Use handleClose instead of onClose
                }
            }
        } catch (error) {
            console.error("Error saving type data:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 rounded-lg space-y-4">
            <h2 className="text-2xl font-bold text-center">
                {isEditing ? "Edit Type" : "Add Type"}
            </h2>
            <Steps currentStep={step} steps={["Range", "Details", "Review"]} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                    {step === 0 && <SelectRange form={form} onNext={nextStep} />}
                    {step === 1 && (
                        <TypeInfo
                            form={form}
                            onNext={nextStep}
                            onPrevious={previousStep}
                        />
                    )}
                    {step === 2 && (
                        <Confirm
                            form={form}
                            onPrevious={previousStep}
                            onSubmit={onSubmit}
                            isEditing={isEditing}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </form>
            </Form>
        </div>
    );
}