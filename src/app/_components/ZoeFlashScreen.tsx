import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Rocket, Monitor, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ZoeFlashScreenProps {
    isOpen: boolean;
    onClose: () => void;
    onStartInterview?: () => void;
}

const ZoeFlashScreen = ({ isOpen, onClose, onStartInterview }: ZoeFlashScreenProps) => {
    const features = [
        "Select the role/topic you want to practice",
        "Experience a real interview-style conversation",
        "Help us improve Zoe with your honest feedback",
    ];

    const access_token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const handleStartInterview = () => {
        window.open(`https://zoe.zuvy.org?token=${access_token}`, '_blank');
        onStartInterview?.();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-card rounded-2xl shadow-zuvy-lg border border-border overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>

                        {/* Content */}
                        <div className="p-8">
                            {/* Header with mascot */}
                            <div className="flex items-center gap-4 mb-6">
                                <Image
                                    src="/images/zoe-talking 1 (3).svg"
                                    alt="Zoe Assistant"
                                    width={100}
                                    height={100}
                                    className="object-contain w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-[120px] lg:h-[120px]"
                                />
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Rocket className="w-5 h-5 text-zuvy-gold" />
                                        <span className="text-sm font-semibold text-zuvy-gold">Beta Access Enabled</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground">Zoe is Live!</h2>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-muted-foreground mb-6">
                                Zoe is an AI-powered tool to help you prepare for 1:1 interviews.
                            </p>

                            {/* Features */}
                            <div className="bg-secondary/50 rounded-xl p-5 mb-6">
                                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-primary" />
                                    What you can do:
                                </h3>
                                <ul className="space-y-2.5">
                                    {features.map((feature, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * (index + 1) }}
                                            className="flex items-start gap-2 text-sm text-foreground/80"
                                        >
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                            {feature}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* Desktop recommendation */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-3 bg-zuvy-gold-light border border-zuvy-gold/20 rounded-lg p-4 mb-6"
                            >
                                <Monitor className="w-5 h-5 text-zuvy-gold shrink-0" />
                                <p className="text-sm text-foreground">
                                    <span className="font-semibold">Best experience:</span> Please use a Laptop/Desktop
                                </p>
                            </motion.div>

                            {/* Footer message */}
                            <p className="text-sm text-muted-foreground text-center mb-6 italic">
                                You&apos;re among the first users — your feedback will directly shape Zoe.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={handleStartInterview}
                                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5"
                                >
                                    Start Interview
                                </Button>
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="flex-1 border-border hover:bg-muted py-5"
                                >
                                    Explore Later
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ZoeFlashScreen;