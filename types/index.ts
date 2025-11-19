export interface Category {
  id: number;
  name: string;
  position: number;
  created_at: string;
}

export interface Item {
  id: number;
  category_id: number;
  content: string;
  is_completed: boolean;
  due_date: string | null;
  position: number;
  created_at: string;
}

export interface CategoryWithItems extends Category {
  items: Item[];
}
