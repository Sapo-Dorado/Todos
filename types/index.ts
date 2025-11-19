export interface Universe {
  id: number;
  name: string;
  position: number;
  created_at: string;
}

export interface Category {
  id: number;
  universe_id: number;
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
  today_position: number | null;
  created_at: string;
}

export interface CategoryWithItems extends Category {
  items: Item[];
}
