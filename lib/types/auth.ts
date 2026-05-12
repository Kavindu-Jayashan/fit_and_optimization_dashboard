// core domain types for authentication

// represent a stored OTP entry
// keep in memory as for now  
// replace with NEXT Auth soon 
export type OTPRecord ={
    otp:string;
    expireAt: number;
}

// represent an authenticated session user.
// stored in server-side after successful OTP verification.

export  type SessionUser = {
    email: string;
}