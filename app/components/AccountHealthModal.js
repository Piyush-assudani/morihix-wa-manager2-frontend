"use client";

import { useState, useEffect } from "react";
import { X, Activity, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { getAccountHealth } from "../lib/api";

export default function AccountHealthModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    getAccountHealth()
      .then((res) => {
        if (isMounted) setData(res.data);
      })
      .catch((err) => {
        if (isMounted) setError(err.response?.data?.error || err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const renderQualityBadge = (quality) => {
    let color = "text-gray-500";
    let bg = "bg-gray-100";
    let Icon = Activity;

    switch (quality?.toUpperCase()) {
      case "GREEN":
        color = "text-green-600";
        bg = "bg-green-100";
        Icon = CheckCircle;
        break;
      case "YELLOW":
        color = "text-yellow-600";
        bg = "bg-yellow-100";
        Icon = AlertTriangle;
        break;
      case "RED":
        color = "text-red-600";
        bg = "bg-red-100";
        Icon = ShieldAlert;
        break;
    }

    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${bg} ${color} font-medium`}>
        <Icon size={16} />
        {quality || "UNKNOWN"}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
            <Activity className="text-blue-500" />
            Meta Account Health
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="loading-spinner"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          ) : data ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Quality Rating</span>
                {renderQualityBadge(data.quality_rating)}
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Messaging Tier</span>
                <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">
                  {data.messaging_limit_tier || "UNKNOWN"}
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Phone Number</span>
                <span className="font-medium text-gray-700">
                  {data.display_phone_number || "UNKNOWN"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Account Status</span>
                <span className={`font-medium ${data.status === 'CONNECTED' ? 'text-green-600' : 'text-gray-700'}`}>
                  {data.status || "UNKNOWN"}
                </span>
              </div>
              
              <div className="mt-4 text-xs text-gray-400 text-center">
                Data is fetched directly from Meta Cloud API
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
