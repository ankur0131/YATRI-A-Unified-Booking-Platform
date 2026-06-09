import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { readStorage, writeStorage } from "../utils/storage";

const BookingContext = createContext(null);

const INITIAL_DRAFT = {
  selectedTransport: null,
  selectedSeats: [],
  passengerCount: 1,
  selectedClass: null,
  totalPrice: 0,
  userDetails: {
    name: "",
    email: "",
    phone: "",
  },
};

export function BookingProvider({ children }) {
  const [draft, setDraft] = useState(() => readStorage("yatri-booking-draft", INITIAL_DRAFT));
  const [bookingHistory, setBookingHistory] = useState(() => readStorage("yatri-booking-history", []));
  const [latestBooking, setLatestBooking] = useState(() => readStorage("yatri-latest-booking", null));
  const [searchCriteria, setSearchCriteria] = useState(() => readStorage("yatri-search-criteria", null));

  useEffect(() => {
    writeStorage("yatri-booking-draft", draft);
  }, [draft]);

  useEffect(() => {
    writeStorage("yatri-booking-history", bookingHistory);
  }, [bookingHistory]);

  useEffect(() => {
    writeStorage("yatri-latest-booking", latestBooking);
  }, [latestBooking]);

  useEffect(() => {
    writeStorage("yatri-search-criteria", searchCriteria);
  }, [searchCriteria]);

  const setSelectedTransport = useCallback((transport) => {
    setDraft((current) => ({
      ...current,
      selectedTransport: transport,
      selectedSeats: [],
      passengerCount: 1,
      selectedClass: null,
      totalPrice: transport?.type === "cab" ? transport.price : 0,
    }));
  }, []);

  const setPassengerCount = useCallback((count) => {
    const normalizedCount = Math.max(1, Number(count) || 1);
    setDraft((current) => {
      const nextSeats = current.selectedSeats.slice(0, normalizedCount);
      const perSeat = current.selectedTransport?.type === "train" && current.selectedClass
        ? current.selectedClass.price
        : current.selectedTransport?.type === "cab"
        ? current.selectedTransport.price
        : current.selectedTransport
        ? (current.selectedTransport.price || current.selectedTransport.estimatedPrice)
        : 0;

      return {
        ...current,
        passengerCount: normalizedCount,
        selectedSeats: nextSeats,
        totalPrice: current.selectedTransport?.type === "cab"
          ? current.selectedTransport.price
          : nextSeats.length * perSeat,
      };
    });
  }, []);

  const setSelectedClass = useCallback((cls) => {
    setDraft((current) => {
      const newTotalPrice = current.selectedTransport?.type === "train" && cls
        ? (cls.price * current.selectedSeats.length)
        : current.selectedTransport?.type === "cab"
        ? current.selectedTransport.price
        : current.totalPrice;
      
      return {
        ...current,
        selectedClass: cls,
        totalPrice: newTotalPrice,
      };
    });
  }, []);

  const toggleSeat = useCallback((seatId, maxSeats = 6) => {
    setDraft((current) => {
      const exists = current.selectedSeats.includes(seatId);
      if (!exists && current.selectedSeats.length >= maxSeats) {
        return current;
      }

      const nextSeats = exists
        ? current.selectedSeats.filter((seat) => seat !== seatId)
        : [...current.selectedSeats, seatId];

      let perSeat = 0;
      if (current.selectedTransport?.type === "train" && current.selectedClass) {
        perSeat = current.selectedClass.price;
      } else if (current.selectedTransport?.type === "cab") {
        perSeat = current.selectedTransport.price;
      } else {
        perSeat = current.selectedTransport ? (current.selectedTransport.price || current.selectedTransport.estimatedPrice) : 0;
      }

      return {
        ...current,
        selectedSeats: nextSeats,
        totalPrice: current.selectedTransport?.type === "cab"
          ? current.selectedTransport.price
          : nextSeats.length * perSeat,
      };
    });
  }, []);

  const setUserDetails = useCallback((details) => {
    setDraft((current) => ({
      ...current,
      userDetails: {
        ...current.userDetails,
        ...details,
      },
    }));
  }, []);

  const clearDraft = useCallback(() => {
    setDraft(INITIAL_DRAFT);
  }, []);

  const confirmBooking = useCallback((booking) => {
    setBookingHistory((current) => [booking, ...current]);
    setLatestBooking(booking);
    setDraft(INITIAL_DRAFT);
  }, []);

  const markLatestBookingCancelled = useCallback(() => {
    setLatestBooking((current) => {
      if (!current) return current;
      return { ...current, status: "cancelled" };
    });
    setBookingHistory((current) =>
      current.map((booking) => {
        if (!latestBooking) return booking;
        const sameLocalId = booking.id && booking.id === latestBooking.id;
        const sameBackendId =
          booking.backendBooking?._id &&
          latestBooking.backendBooking?._id &&
          booking.backendBooking._id === latestBooking.backendBooking._id;
        return sameLocalId || sameBackendId
          ? { ...booking, status: "cancelled" }
          : booking;
      })
    );
  }, [latestBooking]);

  const value = useMemo(
    () => ({
      selectedTransport: draft.selectedTransport,
      selectedSeats: draft.selectedSeats,
      passengerCount: draft.passengerCount,
      selectedClass: draft.selectedClass,
      totalPrice: draft.totalPrice,
      userDetails: draft.userDetails,
      bookingHistory,
      latestBooking,
      searchCriteria,
      setSelectedTransport,
      setSelectedClass,
      setPassengerCount,
      toggleSeat,
      setUserDetails,
      clearDraft,
      confirmBooking,
      markLatestBookingCancelled,
      setSearchCriteria,
    }),
    [
      draft.selectedTransport,
      draft.selectedSeats,
      draft.passengerCount,
      draft.selectedClass,
      draft.totalPrice,
      draft.userDetails,
      bookingHistory,
      latestBooking,
      searchCriteria,
      setSelectedTransport,
      setSelectedClass,
      setPassengerCount,
      toggleSeat,
      setUserDetails,
      clearDraft,
      confirmBooking,
      markLatestBookingCancelled,
      setSearchCriteria,
    ]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
