"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import {
  User,
  MapPin,
  Plus,
  Trash2,
  Star,
  ShieldCheck,
  KeyRound,
  Phone,
} from "lucide-react";
import { SavedAddress } from "@/lib/types";

interface MeResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isPhoneVerified?: boolean;
}

const emptyAddress: Omit<SavedAddress, "_id" | "isDefault"> = {
  fullName: "",
  phone: "",
  pincode: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  landmark: "",
};

export default function ProfilePageClient() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addrLoading, setAddrLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editAddressId, setEditAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] =
    useState<typeof emptyAddress>(emptyAddress);

  // Security states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [phoneInput, setPhoneInput] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

  // ----------------- Helpers -----------------

  const fetchProfile = async () => {
    try {
      // NOTE: agar tumhara endpoint /users/me ya kuch aur hai to yahan change karo
      const res = await apiClient.get("/auth/me");
      const root = res.data;
      const payload = root?.data ?? root;
      const user = payload?.user ?? payload;

      const profile: MeResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
      };

      setMe(profile);
      if (profile.phone) {
        setPhoneInput(profile.phone);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to load profile. Please login again."
      );
    }
  };

  const fetchAddresses = async () => {
    try {
      setAddrLoading(true);
      const res = await apiClient.get("/addresses");
      const root = res.data;
      const payload = root?.data ?? root;
      const list = payload?.addresses ?? payload;
      const arr: SavedAddress[] = Array.isArray(list) ? list : [];
      setAddresses(arr);
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    } finally {
      setAddrLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await Promise.all([fetchProfile(), fetchAddresses()]);
      setIsLoading(false);
    })();
  }, []);

  const handleAddressChange = (
    field: keyof typeof emptyAddress,
    value: string
  ) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setEditAddressId(null);
    setAddressForm(emptyAddress);
  };

  const handleEditAddress = (addr: SavedAddress) => {
    setEditAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      pincode: addr.pincode,
      line1: addr.line1,
      line2: addr.line2 || "",
      city: addr.city,
      state: addr.state,
      landmark: addr.landmark || "",
    });
  };

  const handleSubmitAddress = async () => {
    if (!addressForm.fullName.trim() || !addressForm.phone.trim()) {
      alert("Name and phone are required.");
      return;
    }

    try {
      setAddrLoading(true);
      if (editAddressId) {
        await apiClient.put(`/addresses/${editAddressId}`, addressForm);
      } else {
        await apiClient.post("/addresses", addressForm);
      }
      await fetchAddresses();
      resetForm();
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to save address. Please try again."
      );
    } finally {
      setAddrLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      setAddrLoading(true);
      await apiClient.delete(`/addresses/${id}`);
      await fetchAddresses();
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to delete address. Please try again."
      );
    } finally {
      setAddrLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setAddrLoading(true);
      await apiClient.patch(`/addresses/${id}/default`);
      await fetchAddresses();
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to set default address. Please try again."
      );
    } finally {
      setAddrLoading(false);
    }
  };

  // -------- Security handlers --------

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert("Please enter current and new password.");
      return;
    }
    try {
      setIsChangingPassword(true);
      await apiClient.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      alert("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to change password. Please try again."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!phoneInput) {
      alert("Please enter phone number.");
      return;
    }
    try {
      setIsVerifyingPhone(true);
      await apiClient.post("/auth/phone/send-otp", { phone: phoneInput });
      setOtpSent(true);
      alert("OTP sent to phone.");
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneInput || !otp) {
      alert("Please enter phone and OTP.");
      return;
    }
    try {
      setIsVerifyingPhone(true);
      const res = await apiClient.post("/auth/phone/verify", {
        phone: phoneInput,
        otp,
      });
      alert("Phone verified successfully.");
      setOtp("");
      setOtpSent(false);

      const user = res.data?.data?.user ?? res.data?.user;
      if (user) {
        setMe((prev) =>
          prev
            ? {
                ...prev,
                phone: user.phone,
                isPhoneVerified: user.isPhoneVerified,
              }
            : prev
        );
      }
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Failed to verify phone. Please try again."
      );
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  // ----------------- Render -----------------

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="rounded-md bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
          Loading profile...
        </p>
      </div>
    );
  }

  if (error || !me) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="max-w-sm rounded-md bg-white p-4 text-center shadow-sm">
          <p className="text-sm text-slate-700">{error}</p>
          <a
            href="/auth/login-otp"
            className="mt-3 inline-block rounded bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Login Again
          </a>
        </div>
      </div>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-[1.2fr,2fr]">
      {/* Left: Profile summary */}
      <div className="space-y-3 rounded-md bg-white p-3 shadow-sm md:p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {me.name || "User"}
            </p>
            <p className="text-xs text-slate-500">{me.email}</p>
            {me.phone && (
              <p className="text-xs text-slate-500">
                +91 {me.phone}{" "}
                {me.isPhoneVerified && (
                  <span className="ml-1 rounded-full bg-green-50 px-2 py-px text-[10px] font-semibold text-green-700">
                    Verified
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Manage your profile, saved delivery addresses, and account security.
        </p>
      </div>

      {/* Right: Saved addresses */}
      <div className="space-y-3 rounded-md bg-white p-3 shadow-sm md:p-4">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800 md:text-base">
            <MapPin className="h-4 w-4 text-brand-primary" />
            Saved Addresses
          </h2>
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-1 rounded border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 md:text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New
          </button>
        </div>

        {/* Address form */}
        <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 md:p-4 md:text-sm">
          <p className="text-[11px] font-semibold text-slate-700 md:text-xs">
            {editAddressId ? "Edit Address" : "Add New Address"}
          </p>

          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                Full Name
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                value={addressForm.fullName}
                onChange={(e) =>
                  handleAddressChange("fullName", e.target.value)
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                Phone
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                value={addressForm.phone}
                onChange={(e) => handleAddressChange("phone", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                Pincode
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                value={addressForm.pincode}
                onChange={(e) =>
                  handleAddressChange("pincode", e.target.value)
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                City
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                value={addressForm.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                State
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                value={addressForm.state}
                onChange={(e) => handleAddressChange("state", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                Landmark (optional)
              </label>
              <input
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                value={addressForm.landmark}
                onChange={(e) =>
                  handleAddressChange("landmark", e.target.value)
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                Address (House no, building, area)
              </label>
              <textarea
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                rows={2}
                value={addressForm.line1}
                onChange={(e) => handleAddressChange("line1", e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {editAddressId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded border border-slate-300 px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-100 md:text-xs"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              disabled={addrLoading}
              onClick={handleSubmitAddress}
              className="rounded bg-brand-primary px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-70 md:text-xs"
            >
              {addrLoading
                ? "Saving..."
                : editAddressId
                ? "Update Address"
                : "Save Address"}
            </button>
          </div>
        </div>

        {/* Saved addresses list */}
        <div className="space-y-2">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 text-xs text-slate-700 md:flex-row md:items-start md:justify-between md:p-4 md:text-sm"
            >
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-semibold text-slate-900">
                    {addr.fullName}
                  </p>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 md:text-[11px]">
                      <Star className="h-3 w-3 fill-green-500 text-green-500" />
                      Default
                    </span>
                  )}
                </div>
                <p>
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ""}
                </p>
                <p>
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                {addr.landmark && <p>Landmark: {addr.landmark}</p>}
                <p className="text-[11px] text-slate-500 md:text-xs">
                  Phone: {addr.phone}
                </p>
              </div>
              <div className="flex items-center gap-2 md:flex-col md:items-end">
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-[11px] font-semibold text-brand-primary hover:text-blue-700 md:text-xs"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleEditAddress(addr)}
                  className="text-[11px] text-slate-600 hover:text-slate-900 md:text-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(addr._id)}
                  className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 md:text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
          {addresses.length === 0 && (
            <p className="text-[11px] text-slate-500 md:text-xs">
              You have no saved addresses yet.
            </p>
          )}
        </div>
      </div>

      {/* Security section – spans full width on md+ */}
      <div className="space-y-3 rounded-md bg-white p-3 shadow-sm md:col-span-2 md:p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <h2 className="text-sm font-semibold text-slate-800 md:text-base">
            Security
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {/* Change password */}
          <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 md:p-4 md:text-sm">
            <div className="mb-1 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-slate-700" />
              <p className="text-xs font-semibold text-slate-800 md:text-sm">
                Change Password
              </p>
            </div>
            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isChangingPassword}
                  onClick={handleChangePassword}
                  className="rounded bg-slate-900 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-black disabled:opacity-70 md:text-xs"
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>

          {/* Phone verification */}
          <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 md:p-4 md:text-sm">
            <div className="mb-1 flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-primary" />
              <p className="text-xs font-semibold text-slate-800 md:text-sm">
                Phone Verification
              </p>
            </div>
            <div className="space-y-2">
              <div>
                <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                  Phone Number
                </label>
                <input
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                />
              </div>
              {otpSent && (
                <div>
                  <label className="mb-1 block text-[11px] text-slate-600 md:text-xs">
                    Enter OTP
                  </label>
                  <input
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 md:text-sm"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                {!otpSent && (
                  <button
                    type="button"
                    disabled={isVerifyingPhone}
                    onClick={handleSendPhoneOtp}
                    className="rounded border border-slate-300 px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-100 disabled:opacity-70 md:text-xs"
                  >
                    Send OTP
                  </button>
                )}
                {otpSent && (
                  <button
                    type="button"
                    disabled={isVerifyingPhone}
                    onClick={handleVerifyPhone}
                    className="rounded bg-brand-primary px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-70 md:text-xs"
                  >
                    {isVerifyingPhone ? "Verifying..." : "Verify Phone"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
