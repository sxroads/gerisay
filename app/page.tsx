"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function calculateWorkDays(targetDate: Date): number {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const target = new Date(targetDate);
	target.setHours(0, 0, 0, 0);

	if (target <= today) {
		return 0;
	}

	let workDays = 0;
	const current = new Date(today);

	while (current < target) {
		const dayOfWeek = current.getDay();
		if (dayOfWeek !== 0 && dayOfWeek !== 6) {
			workDays++;
		}
		current.setDate(current.getDate() + 1);
	}

	return workDays;
}

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

function calculateTodayRemainingHours(): {
	hours: number;
	minutes: number;
	seconds: number;
} {
	const now = new Date();
	const dayOfWeek = now.getDay();

	// If weekend, return 0
	if (dayOfWeek === 0 || dayOfWeek === 6) {
		return { hours: 0, minutes: 0, seconds: 0 };
	}

	const endOfWorkDay = new Date(now);
	const startOfWorkDay = new Date(now);
	endOfWorkDay.setHours(17, 0, 0, 0);
	startOfWorkDay.setHours(8, 0, 0, 0);

	// If current time >= 17:00, return 0
	if (now >= endOfWorkDay) {
		return { hours: 0, minutes: 0, seconds: 0 };
	} else if (now < startOfWorkDay) {
		return { hours: 0, minutes: 0, seconds: 0 };
	}

	const diffMs = endOfWorkDay.getTime() - now.getTime();
	const totalSeconds = Math.floor(diffMs / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return { hours, minutes, seconds };
}

function calculateTotalRemainingHours(
	targetDate: Date,
	todayRemaining: { hours: number; minutes: number; seconds: number }
): { hours: number; minutes: number; seconds: number } {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const target = new Date(targetDate);
	target.setHours(0, 0, 0, 0);

	if (target <= today) {
		return todayRemaining;
	}

	// Calculate remaining work days (excluding today)
	let remainingWorkDays = 0;
	const current = new Date(today);
	current.setDate(current.getDate() + 1); // Start from tomorrow

	while (current < target) {
		const dayOfWeek = current.getDay();
		if (dayOfWeek !== 0 && dayOfWeek !== 6) {
			remainingWorkDays++;
		}
		current.setDate(current.getDate() + 1);
	}

	// Convert today's remaining time to total seconds
	const todaySeconds =
		todayRemaining.hours * 3600 +
		todayRemaining.minutes * 60 +
		todayRemaining.seconds;

	// Add remaining work days (8 hours = 28800 seconds per day)
	const totalSeconds = todaySeconds + remainingWorkDays * 28800;

	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return { hours, minutes, seconds };
}

function formatTime(hours: number, minutes: number, seconds: number): string {
	return `${hours}h ${minutes}m ${seconds}s`;
}

export default function Home() {
	const [selectedDate, setSelectedDate] = useState<Date | null | undefined>(
		undefined
	);
	const [todayRemaining, setTodayRemaining] = useState({
		hours: 0,
		minutes: 0,
		seconds: 0,
	});
	const [totalRemaining, setTotalRemaining] = useState({
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	const isLoaded = selectedDate !== undefined;
	const targetDate = selectedDate
		? selectedDate.toISOString().split("T")[0]
		: "";
	const workDays = selectedDate ? calculateWorkDays(selectedDate) : null;

	useEffect(() => {
		queueMicrotask(() => {
			const storedDate = localStorage.getItem("targetDate");
			setSelectedDate(storedDate ? new Date(storedDate) : null);
		});
	}, []);

	useEffect(() => {
		if (!isLoaded || !selectedDate) return;
		localStorage.setItem(
			"targetDate",
			selectedDate.toISOString().split("T")[0]
		);
	}, [selectedDate, isLoaded]);

	useEffect(() => {
		if (!selectedDate || !isLoaded) return;

		const updateCountdowns = () => {
			const todayRemainingTime = calculateTodayRemainingHours();
			setTodayRemaining(todayRemainingTime);

			const totalRemainingTime = calculateTotalRemainingHours(
				selectedDate,
				todayRemainingTime
			);
			setTotalRemaining(totalRemainingTime);
		};

		updateCountdowns();
		const interval = setInterval(updateCountdowns, 1000);
		return () => clearInterval(interval);
	}, [selectedDate, isLoaded]);

	const handleDateChange = (date: Date | null) => {
		setSelectedDate(date);
	};

	const handleClear = () => {
		setSelectedDate(null);
		localStorage.removeItem("targetDate");
	};

	if (!isLoaded) {
		return (
			<div className="flex min-h-screen items-center justify-center font-sans">
				<div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center font-sans">
			<main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 px-8 py-16">
				<div className="flex flex-col items-center gap-6 text-center">
					<h1 className="text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50">
						Work Days Countdown
					</h1>

					{targetDate ? (
						<div className="flex flex-col items-center gap-6">
							<div className="flex flex-col items-center gap-2">
								<div className="text-6xl font-bold text-black dark:text-zinc-50">
									{workDays}
								</div>
								<p className="text-xl text-zinc-600 dark:text-zinc-400">
									work days until {formatDate(targetDate)}
								</p>
							</div>

							<div className="flex flex-col items-center gap-4 w-full max-w-md">
								<div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] w-full bg-white/50 dark:bg-white/[.06]">
									<p className="text-sm text-zinc-500 dark:text-zinc-400">
										Todays remaining work hours
									</p>
									<div className="text-3xl font-semibold text-black dark:text-zinc-50">
										{formatTime(
											todayRemaining.hours,
											todayRemaining.minutes,
											todayRemaining.seconds
										)}
									</div>
								</div>

								<div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] w-full bg-white/50 dark:bg-white/[.06]">
									<p className="text-sm text-zinc-500 dark:text-zinc-400">
										Total remaining work hours
									</p>
									<div className="text-3xl font-semibold text-black dark:text-zinc-50">
										{formatTime(
											totalRemaining.hours,
											totalRemaining.minutes,
											totalRemaining.seconds
										)}
									</div>
								</div>
							</div>

							<div className="flex gap-4 mt-4">
								<button
									onClick={handleClear}
									className="px-6 py-2 rounded-full border border-solid border-black/[.08] text-black dark:border-white/[.145] dark:text-zinc-50 transition-colors hover:border-transparent hover:bg-black/[.04] dark:hover:bg-[#1a1a1a]"
								>
									Change Date
								</button>
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center gap-6 w-full max-w-md">
							<p className="text-lg text-zinc-600 dark:text-zinc-400">
								Enter your target date to see how many work days remain
							</p>
							<div className="w-full [&_.react-datepicker-wrapper]:w-full [&_.react-datepicker__input-container]:w-full">
								<DatePicker
									selected={selectedDate}
									onChange={handleDateChange}
									minDate={new Date()}
									dateFormat="MMMM d, yyyy"
									placeholderText="Select a date"
									className="w-full px-4 py-3 rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] bg-white dark:bg-[#1a1a1a] text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white cursor-pointer"
									wrapperClassName="w-full"
									calendarClassName="!bg-white dark:!bg-[#1a1a1a] !border-black/[.08] dark:!border-white/[.145] !rounded-lg !shadow-lg"
									dayClassName={(date) =>
										date.getDay() === 0 || date.getDay() === 6
											? "!text-zinc-400 dark:!text-zinc-600"
											: "!text-black dark:!text-zinc-50 hover:!bg-black/[.04] dark:hover:!bg-white/[.08]"
									}
								/>
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
