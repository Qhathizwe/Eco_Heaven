
export type user_role = "admin" | "user";

export interface User {
    id: number,
    name: string,
    surname: string,
    email: string,
    password: string,
    phone: number,
    role: user_role,
    created_at?: Date, 
}
 export type new_user = Omit<User, 'id' >;
