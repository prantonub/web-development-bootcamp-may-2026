import {
  Utensils,
  Car,
  ShoppingBag,
  Lightbulb,
  Pill,
  Film,
  GraduationCap,
  Plane,
  PiggyBank,
  Wallet,
  Laptop,
  Package,
  CreditCard,
} from "lucide-react";

/**
 * Category -> icon mapping. Replaces the emoji that used to live in
 * utils/categories.js and utils/helpers.js.
 */
const CATEGORY_ICONS = {
  "Food & Dining": Utensils,
  Transportation: Car,
  Shopping: ShoppingBag,
  "Bills & Utilities": Lightbulb,
  Healthcare: Pill,
  Entertainment: Film,
  Education: GraduationCap,
  Travel: Plane,
  Savings: PiggyBank,
  Salary: Wallet,
  Freelance: Laptop,
  Other: Package,
};

/** Returns the icon component for a category (CreditCard as fallback). */
export const getCategoryIconComponent = (name) =>
  CATEGORY_ICONS[name] || CreditCard;

export default function CategoryIcon({ name, className = "w-5 h-5" }) {
  const Icon = getCategoryIconComponent(name);
  return <Icon className={className} aria-hidden="true" />;
}