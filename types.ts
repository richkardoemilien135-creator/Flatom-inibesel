
export type Category = 'Tout' | 'Rad' | 'Sandal' | 'Cheve' | 'Bijou' | 'Kosmetik' | 'Elektrik';

export interface Comment {
  id: string;
  userName: string;
  text: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  image: string;
  description: string;
  seller?: string; // Pou mete non moun nan ($emilien, $richkardo)
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Reservation {
  id: string;
  product: Product;
  date: string;
  status: 'Pandan' | 'Konfime' | 'Anile';
}

export type PaymentMethod = 'Wise' | 'MonCash' | 'Bank';
