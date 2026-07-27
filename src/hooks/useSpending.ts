import { useMemo } from 'react';
import { Subscription } from '../types';
import { normalizeToMonthly, getLast6Months } from '../utils/dates';
import { CATEGORIES } from '../utils/categories';

interface MonthlyData {
  month: string;
  total: number;
  [category: string]: string | number;
}

export const useSpending = (subscriptions: Subscription[]) => {
  const totalMonthly = useMemo(() => {
    return subscriptions.reduce((sum, sub) => sum + normalizeToMonthly(sub.amount, sub.billingCycle), 0);
  }, [subscriptions]);

  const totalYearly = useMemo(() => totalMonthly * 12, [totalMonthly]);

  const renewingThisWeek = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    
    return subscriptions.filter(sub => {
      const date = new Date(sub.nextDate);
      return date >= now && date <= weekFromNow;
    }).length;
  }, [subscriptions]);

  const chartData = useMemo((): MonthlyData[] => {
    const months = getLast6Months();
    
    return months.map(({ label }) => {
      const monthData: MonthlyData = { month: label, total: 0 };
      
      CATEGORIES.forEach(cat => {
        const catSubs = subscriptions.filter(s => s.category === cat.id);
        const catTotal = catSubs.reduce((sum, sub) => sum + normalizeToMonthly(sub.amount, sub.billingCycle), 0);
        monthData[cat.id] = Math.round(catTotal * 100) / 100;
        monthData.total += catTotal;
      });
      
      monthData.total = Math.round(monthData.total * 100) / 100;
      return monthData;
    });
  }, [subscriptions]);

  const byCategory = useMemo(() => {
    const result: Record<string, number> = {};
    subscriptions.forEach(sub => {
      const monthly = normalizeToMonthly(sub.amount, sub.billingCycle);
      result[sub.category] = (result[sub.category] || 0) + monthly;
    });
    return result;
  }, [subscriptions]);

  return { totalMonthly, totalYearly, renewingThisWeek, chartData, byCategory };
};
