// LabelUI/AddLabel.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LabelFormSchema } from "./validationSchemas";
import Steps from "./Steps";
import SelectType from "./SelectType";
import LabelInfo from "./LabelInfo";
import Confirm from "./Confirm";
import { Form } from "@/components/ui/form";
import useLabelStore from "@/store/labelStore";
import { toast } from "react-hot-toast";

export default function AddLabel({ onClose }) {
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addLabels } = useLabelStore();

    const form = useForm({
        resolver: zodResolver(LabelFormSchema),
        defaultValues: {
            type_id: "",
            labels: [{ name: "" }],
            computable: "no",
            expense_method: "amount",
        },
        mode: "onChange",
    });

    const nextStep = () => setStep(step + 1);
    const previousStep = () => setStep(step - 1);

    const handleSubmit = async (values) => {
        try {
            setIsSubmitting(true);
            const isValid = await form.trigger();
            if (isValid) {
                const success = await addLabels(values.type_id, values);
                if (success) {
                    form.reset();
                    onClose();
                }
            }
        } catch (error) {
            console.error("Failed to create labels:", error);
            toast.error("Failed to create labels");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 rounded-lg space-y-4">
            <h2 className="text-2xl font-bold text-center">Add Label</h2>
            <Steps currentStep={step} steps={["Select Type", "Label Info", "Review"]} />
            <Form {...form}>
                <form onSubmit={(e) => e.preventDefault()}>
                    {step === 0 && <SelectType form={form} onNext={nextStep} />}
                    {step === 1 && (
                        <LabelInfo form={form} onNext={nextStep} onPrevious={previousStep} />
                    )}
                    {step === 2 && (
                        <Confirm
                            form={form}
                            onPrevious={previousStep}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </form>
            </Form>
        </div>
    );
}