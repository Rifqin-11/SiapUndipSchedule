"use client";

import Image from "next/image";
import * as React from "react";

// hooks dan utils yang sudah kamu punya
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSubjects, Subject } from "@/hooks/useSubjects";
import { useTasks } from "@/hooks/useTasks";
import { getCurrentDayAndDate, normalizeDayName } from "@/utils/date";
import { useScrollOpacity } from "@/hooks/useScrollOpacity";

/** ===== Utilities lokal kecil2 ===== */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Initials({ name }: { name?: string }) {
  const initials = (name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="size-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white grid place-items-center text-sm font-bold">
      {initials}
    </div>
  );
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

const hasValidSchedule = (s: Subject) =>
  !!s?.day && !!s?.startTime && !!s?.endTime;

/** ===== Props ===== */

type BaseProps = {
  /** Judul yang tampil besar (default: diturunkan dari variant) */
  title?: string;
  /** Slot kanan (mis. tombol Add, filter) */
  rightSlot?: React.ReactNode;
  /** ClassName wrapper */
  className?: string;
  /** Sembunyikan avatar profile */
  hideAvatar?: boolean;
  /** Override avatar jika perlu */
  avatarOverride?: { name?: string; imageUrl?: string };
};

type CalendarExtras = {
  /** Untuk variant="calendar": paksa hitung untuk hari tertentu */
  selectedDay?: string; // boleh English/Indonesia/abbr, akan dinormalisasi
};

type CustomExtras = {
  /** Untuk variant="custom": kirim subtitle manual */
  subtitle?: React.ReactNode;
};

type PageHeaderProps =
  | ({ variant: "calendar" } & BaseProps & CalendarExtras)
  | ({ variant: "tasks" } & BaseProps)
  | ({ variant: "custom" } & BaseProps & CustomExtras);

/** ===== Component ===== */

export default function PageHeader(props: PageHeaderProps) {
  const { user } = useUserProfile();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();

  // Hook untuk scroll opacity effect
  const scrollOpacity = useScrollOpacity({
    fadeDistance: 20,
    startOffset: 10,
  });

  // avatar default dari user profile, tapi bisa dioverride
  const avatar = props.avatarOverride ?? {
    name: user?.name,
    imageUrl: user?.profileImage,
  };

  // Always call hooks at the top level
  const { currentDay } = getCurrentDayAndDate();
  const dayToCheck =
    props.variant === "calendar" ? props.selectedDay || currentDay : currentDay;

  const subjectsToday =
    props.variant === "calendar" && Array.isArray(subjects)
      ? subjects.filter(
          (s) =>
            hasValidSchedule(s) &&
            normalizeDayName(s.day) === normalizeDayName(dayToCheck)
        )
      : [];

  const count = props.variant === "calendar" ? subjectsToday.length : 0;

  const calendarSubtitle = React.useMemo(() => {
    if (subjectsLoading) return "Loading subjects...";
    const isCurr =
      normalizeDayName(dayToCheck) === normalizeDayName(currentDay);
    const dayText = isCurr ? "today" : dayToCheck;
    if (count === 0) return `No classes scheduled for ${dayText}`;
    if (count === 1)
      return `You have 1 subject ${isCurr ? "today" : `on ${dayText}`}!`;
    return `You have ${count} subjects ${isCurr ? "today" : `on ${dayText}`}!`;
  }, [subjectsLoading, count, dayToCheck, currentDay]);

  // Always call hooks at the top level
  const dueTodayCount = React.useMemo(
    () => tasks.filter((t) => isToday(t.dueDate)).length,
    [tasks]
  );

  /** ------- CALENDAR MODE ------- */
  if (props.variant === "calendar") {
    const title = props.title ?? "Calendar";

    return (
      <HeaderFrame
        title={title}
        subtitle={calendarSubtitle}
        rightSlot={props.rightSlot}
        className={props.className}
        avatar={props.hideAvatar ? undefined : avatar}
        opacity={scrollOpacity}
      />
    );
  }

  /** ------- TASKS MODE ------- */
  if (props.variant === "tasks") {
    const subtitle = tasksLoading
      ? "Loading tasks..."
      : dueTodayCount === 0
      ? "No tasks due today"
      : dueTodayCount === 1
      ? "You have 1 task due today"
      : `You have ${dueTodayCount} tasks due today`;

    const title = props.title ?? "Tasks";

    return (
      <HeaderFrame
        title={title}
        subtitle={subtitle}
        rightSlot={props.rightSlot}
        className={props.className}
        avatar={props.hideAvatar ? undefined : avatar}
        opacity={scrollOpacity}
      />
    );
  }

  /** ------- CUSTOM MODE ------- */
  const title = props.title ?? "Page";
  return (
    <HeaderFrame
      title={title}
      subtitle={props.subtitle}
      rightSlot={props.rightSlot}
      className={props.className}
      avatar={props.hideAvatar ? undefined : avatar}
      opacity={scrollOpacity}
    />
  );
}

/** ===== Presentational frame (UI murni) ===== */

function HeaderFrame({
  title,
  subtitle,
  rightSlot,
  className,
  avatar,
  opacity = 1,
}: {
  title: string;
  subtitle?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
  avatar?: { name?: string; imageUrl?: string };
  opacity?: number;
}) {
  return (
    <section
      className={cn(
        // Mobile: fixed positioning dengan full width
        "lg:relative lg:top-auto lg:left-auto lg:right-auto lg:z-auto lg:bg-transparent lg:backdrop-blur-none",
        "fixed top-0 left-0 right-0 z-50",
        "mt-4 lg:mb-2 mx-5",
        className
      )}
      style={{
        opacity: opacity < 1 ? opacity : undefined,
        pointerEvents: opacity < 0.3 ? "none" : "auto",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-bold text-xl truncate">{title}</h1>
          {subtitle ? (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {rightSlot}
          {avatar ? (
            avatar.imageUrl ? (
              <Image
                src={avatar.imageUrl}
                alt="Profile"
                width={40}
                height={40}
                priority={true}
                className="rounded-full object-cover size-10"
              />
            ) : (
              <Initials name={avatar.name} />
            )
          ) : null}
        </div>
      </div>
    </section>
  );
}
