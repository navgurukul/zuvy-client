import { useRef, useState } from 'react';
import { api } from '@/utils/axios.config';
import { UseSwitchOrgReturn, SwitchOrgPayload, SwitchOrgResponse, SwitchOrgResult } from '@/hooks/hookType';
import { getUser } from '@/store/store';
import { toast } from '@/components/ui/use-toast';

const useSwitchOrg = (): UseSwitchOrgReturn => {
    const [isSwitching, setIsSwitching] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const inFlightRef = useRef(false);
    const { setUser } = getUser();

    const switchOrg = async (payload: SwitchOrgPayload): Promise<SwitchOrgResult> => {
        if (inFlightRef.current) {
            return { success: false, message: 'Switching organization already in progress.' };
        }

        inFlightRef.current = true;
        setIsSwitching(true);
        setError(null);

        try {
            const response = await api.post<SwitchOrgResponse>('/org/switch-org', payload);
            const data = response.data;

            if (data.isSuccess || data.status === 'success') {
                // Update tokens in localStorage
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);

                // Update user in store
                setUser(data.data);

                toast({
                    title: 'Success',
                    description: data.message || 'Switched organization successfully.',
                });

                return {
                    success: true,
                    message: data.message || 'Switched organization successfully.',
                };
            }

            const message = data.message || 'Failed to switch organization';
            setError(message);
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
            return { success: false, message };
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to switch organization';
            setError(message);
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
            return { success: false, message };
        } finally {
            inFlightRef.current = false;
            setIsSwitching(false);
        }
    };

    return { switchOrg, isSwitching, error };
};

export default useSwitchOrg;
