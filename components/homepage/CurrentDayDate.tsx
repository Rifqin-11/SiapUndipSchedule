"use client";

import { getCurrentDayAndDate } from '@/utils/date';
import React from 'react'

const currentDayDate = () => {
  const { currentDay, currentDate } = getCurrentDayAndDate();
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {currentDay}, {currentDate}
      </p>
    </div>
  );
}

export default currentDayDate
