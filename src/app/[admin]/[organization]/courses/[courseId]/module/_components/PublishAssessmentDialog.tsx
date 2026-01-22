`use client`;

import React, { useState, useMemo, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { set } from 'immutable';

const PublishAssessmentDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [tab, setTab] = useState<'schedule' | 'now'>('schedule');
    const [publishDate, setPublishDate] = useState<Date>(new Date());
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [endNowDate, setEndNowDate] = useState<Date>(new Date());
    const [publishTime, setPublishTime] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [endNowTime, setEndNowTime] = useState('');
    const [isCalendarOpen, setCalendarOpen] = useState(false);
    const [errors, setErrors] = useState<{
        publishTime?: string;
        startTime?: string;
        endTime?: string;
        endNowTime?: string;
    }>({});

    const disablePastDates = (date: Date) => date < addDays(new Date(), -1);

    const isToday = useMemo(() => {
        return startDate.toDateString() === new Date().toDateString();
    }, [startDate]);

    const currentTimeString = useMemo(() => {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }, []);

    const combineDateTime = (date: Date, time: string) => {
        return new Date(`${date.toISOString().split('T')[0]}T${time}:00`);
    };

    const validateTime = (publishTime: string, startTime: string, endTime: string) => {
        const now = new Date();
        const newErrors: {
            publishTime?: string;
            startTime?: string;
            endTime?: string;
        } = {};

        const publishDateTime = combineDateTime(publishDate, publishTime);
        const startDateTime = combineDateTime(startDate, startTime);
        const endDateTime = combineDateTime(endDate, endTime);

        if (publishTime && publishDateTime < now) {
            newErrors.publishTime = 'Publish time cannot be in the past';
        }
        if (publishTime && startTime && publishDateTime > startDateTime) {
            newErrors.publishTime = 'Publish time cannot be after start time';
        }
        if (startTime && isToday && startTime < currentTimeString) {
            newErrors.startTime = 'Start time cannot be in the past';
        }
        if (startTime && endTime && startTime > endTime) {
            newErrors.endTime = 'Start time cannot be after end time';
        }
        if (endTime && publishTime && endDateTime < publishDateTime) {
            newErrors.endTime = 'End time cannot be before publish time';
        }
        if (endTime && startTime && endDateTime < startDateTime) {
            newErrors.endTime = 'End time cannot be before start time';
        }

        setErrors(newErrors);
    };

    const validateNowEndTime = (date: Date, time: string) => {
        const now = new Date();
        const endDateTime = combineDateTime(date, time);
        if (!time) {
            setErrors((prev) => ({ ...prev, endNowTime: undefined }));
        } else if (endDateTime <= now) {
            setErrors((prev) => ({ ...prev, endNowTime: 'End time must be after current time' }));
        } else {
            setErrors((prev) => ({ ...prev, endNowTime: undefined }));
        }
    };

    useEffect(() => {
        if (publishTime || startTime || endTime) {
            validateTime(publishTime, startTime, endTime);
        }
    }, [publishTime, startTime, endTime, publishDate, startDate, endDate]);

    useEffect(() => {
        if (endNowTime) {
            validateNowEndTime(endNowDate, endNowTime);
        }
    }, [endNowDate, endNowTime]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="text-white bg-secondary">Publish</Button>
            </DialogTrigger>
            <DialogOverlay />
            <DialogContent className="p-6 w-[28rem]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Publish</DialogTitle>
                </DialogHeader>
                <Tabs value={tab} onValueChange={(val) => setTab(val as 'schedule' | 'now')}
                    className={`mt-4 text-left`}>
                    <TabsList className="flex bg-white border-b-2 justify-start border-gray-300">
                        <div>
                            <TabsTrigger
                                value="schedule"
                                className={`flex-1 mt-1 ${tab === 'schedule' ? '!text-secondary border-b-green-700 border-b-2 text-bold' : '!text-[#6E6E6E]'}`}
                            >
                                Schedule for Future
                            </TabsTrigger>
                        </div>
                        <div>
                            <TabsTrigger
                                value="now"
                                className={`flex-1 mt-1 ${tab === 'now' ? '!text-secondary border-b-green-700 border-b-2 text-bold' : '!text-[#6E6E6E]'}`}
                            >
                                Publish Now
                            </TabsTrigger>
                        </div>
                    </TabsList>


                    <TabsContent value="schedule" className="mt-4 space-y-4">
                        {[
                            {
                                label: 'Publish Date and Time',
                                date: publishDate,
                                setDate: setPublishDate,
                                time: publishTime,
                                setTime: setPublishTime,
                                error: errors.publishTime,
                            },
                            {
                                label: 'Assessment Start Date and Time',
                                date: startDate,
                                setDate: setStartDate,
                                time: startTime,
                                setTime: setStartTime,
                                error: errors.startTime,
                            },
                            {
                                label: 'Assessment End Date and Time',
                                date: endDate,
                                setDate: setEndDate,
                                time: endTime,
                                setTime: setEndTime,
                                error: errors.endTime,
                            },
                        ].map(({ label, date, setDate, time, setTime, error }, i) => (
                            <div key={i} className="space-y-1">
                                <label className="text-sm font-medium block">{label}</label>
                                <div className="flex items-center justify-start gap-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="w-48 justify-start text-left">
                                                {date ? format(date, 'dd/MM/yyyy') : 'Pick a date'}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </DialogTrigger>

                                        <DialogContent className="w-auto">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={(selected) => setDate(selected || new Date())}
                                                disabled={disablePastDates}
                                                initialFocus
                                            />
                                        </DialogContent>

                                    </Dialog>
                                    <div className="flex items-center justify-center">
                                        <Input
                                            type="time"
                                            className="w-48 mb-2 flex flex-col"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                        />
                                        {error && <p className="text-xs text-red-500 leading-snug mt-1">{error}</p>}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-end gap-2 pt-4">
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button variant="secondary">Schedule Assessment</Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="now" className="mt-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            The assessment will be published and start immediately. Please enter an end time.
                        </p>
                        <div className="space-y-1">
                            <label className="text-sm font-medium block">Assessment End Date and Time</label>
                            <div className="flex justify-start items-center  gap-2">
                                <Dialog open={isCalendarOpen} onOpenChange={setCalendarOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-48 text-left">
                                            {endNowDate ? format(endNowDate, 'dd/MM/yyyy') : 'Pick a date'}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent className="w-auto p-4">
                                        <Calendar
                                            mode="single"
                                            selected={endNowDate}
                                            onSelect={(date) => {setEndNowDate(date || new Date()); setCalendarOpen(false);}}
                                            disabled={disablePastDates}
                                            initialFocus
                                        />
                                    </DialogContent>

                                </Dialog>
                                <div className="flex items-center justify-center">
                                    <Input
                                        type="time"
                                        className="w-48 mb-2 flex flex-col"
                                        value={endNowTime}
                                        onChange={(e) => {
                                            setEndNowTime(e.target.value);
                                            validateNowEndTime(endNowDate, e.target.value);
                                        }}
                                    />
                                    {errors.endNowTime && <p className="text-xs text-red-500 leading-snug mt-1">{errors.endNowTime}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button variant="secondary">Publish Assessment</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default PublishAssessmentDialog;