// Fixed reference data: the categories a listing can belong to.
// These ids are stored in public.books.category, so renaming an id
// orphans existing listings — add new entries instead.

import type { Category } from './types';

export const categories: Category[] = [
  { id: 'engineering', name: 'Engineering', icon: 'Settings', gradient: ['#2563EB', '#06B6D4'] },
  { id: 'computer-science', name: 'Computer Science', icon: 'Code2', gradient: ['#7C3AED', '#2563EB'] },
  { id: 'mathematics', name: 'Mathematics', icon: 'Calculator', gradient: ['#0F766E', '#14B8A6'] },
  { id: 'science', name: 'Science', icon: 'FlaskConical', gradient: ['#16A34A', '#84CC16'] },
  { id: 'commerce', name: 'Commerce & Management', icon: 'BriefcaseBusiness', gradient: ['#D97706', '#F59E0B'] },
  { id: 'humanities', name: 'Humanities', icon: 'Landmark', gradient: ['#DB2777', '#F472B6'] },
  { id: 'medical', name: 'Medical & Pharmacy', icon: 'Stethoscope', gradient: ['#DC2626', '#FB7185'] },
  { id: 'competitive-exams', name: 'Competitive Exams', icon: 'Trophy', gradient: ['#EA580C', '#FACC15'] },
  { id: 'school', name: 'School Textbooks', icon: 'GraduationCap', gradient: ['#4F46E5', '#818CF8'] },
  { id: 'reference', name: 'Reference & Notes', icon: 'NotebookText', gradient: ['#475569', '#94A3B8'] },
];

export const getCategory = (id: string | undefined) =>
  categories.find((category) => category.id === id);
