export type Customer = {
  id: string;
  name: string;
  email: string;
  owner_id?: string;
  created_at?: string;
};

export type Debt = {
  id: string;
  principal: number;
  interest_rate: number;
  updated_at: string;
  customer_id: string;
  status: string;
};
