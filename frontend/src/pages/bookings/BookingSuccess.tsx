// src/pages/BookingSuccess.tsx
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { verifyPaymentThunk } from "../../redux/features/paymentSlice";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { isVerifying, verifiedBooking, error } = useAppSelector((state) => state.payment);

  useEffect(() => {
    if (reference) {
      dispatch(verifyPaymentThunk(reference));
    }
  }, [dispatch, reference]);

  if (isVerifying) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Verifying your payment and securing your booking...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>Verification Failed</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Return Home</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Booking Confirmed! 🎉</h1>
      <p>Your payment was successful and your stay has been reserved.</p>
      {verifiedBooking && (
        <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px", marginTop: "20px" }}>
          <p><strong>Reference:</strong> {verifiedBooking.payment_reference || reference}</p>
          <p><strong>Check-In:</strong> {verifiedBooking.check_in}</p>
          <p><strong>Check-Out:</strong> {verifiedBooking.check_out}</p>
          <p><strong>Guests:</strong> {verifiedBooking.guests}</p>
        </div>
      )}
      <button 
        onClick={() => navigate("/users/profile")} 
        style={{ marginTop: "20px", padding: "10px 20px", background: "#000", color: "#fff", border: "none", borderRadius: "4px" }}
      >
        View My Bookings
      </button>
    </div>
  );
};

export default BookingSuccess;