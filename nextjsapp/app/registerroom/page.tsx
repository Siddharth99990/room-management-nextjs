'use client'
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Cog, MapPin, Monitor, Users } from "lucide-react";
import { roomService, type Room } from "../../api/room.service";
import ProtectedRoute from "@/context/ProtectedRoute";
import { useRoomStore } from "@/stores/roomStore";
import toast from "react-hot-toast";

interface RegisterForm {
    roomname: string;
    roomlocation: string;
    capacity: string;
    equipment: string[];
}

const availableEquipment = [
    "WiFi", "Projector", "Smart TV", "Sound System", "AC", "Lighting",
    "Whiteboard", "Chair", "Desk", "Long Table", "Microphone", "Speaker",
];

const RegisterRoomPage = () => {
    const queryClient = useQueryClient();
    const { addRoom } = useRoomStore();
    const [formData, setFormData] = useState<RegisterForm>({
        roomname: '',
        roomlocation: '',
        capacity: '',
        equipment: []
    });
    const [equipmentSearch, setEquipmentSearch] = useState("");
    const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);

    const addRoomMutation = useMutation({
        mutationFn: (roomData: Omit<Room, 'roomid'>) => addRoom(roomData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            setFormData({
                roomname: '',
                roomlocation: '',
                capacity: '',
                equipment: []
            });
        },
    });

    const addEquipmentHandler = (equipment: string) => {
        if (!formData.equipment.includes(equipment)) {
            setFormData(prev => ({
                ...prev,
                equipment: [...prev.equipment, equipment]
            }));
        }
        setEquipmentSearch("");
        setShowEquipmentDropdown(false);
    }

    const removeEquipment = (equipmentToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            equipment: prev.equipment.filter(eq => eq !== equipmentToRemove)
        }));
    };

    const filteredEquipment = availableEquipment.filter(e =>
        e.toLowerCase().includes(equipmentSearch.toLowerCase()) &&
        !formData.equipment.includes(e)
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'capacity' && value !== '' && !/^\d+$/.test(value)) return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const capacityNumber = parseInt(formData.capacity);
        if (!formData.roomname.trim() || !formData.roomlocation.trim() || isNaN(capacityNumber) || capacityNumber <= 0 || formData.equipment.length === 0) {
            toast.error("Please fill all required fields correctly.");
            return;
        }
        addRoomMutation.mutate({ ...formData, capacity: capacityNumber });
    };

    const features = [
        { icon: <Building2 className="w-6 h-6" />, title: 'Register Rooms', description: 'Register new rooms onto the platform' },
        { icon: <Cog className="w-6 h-6" />, title: "Feature based rooms", description: "Specify features for in a dynamic manner" }
    ];

    return (
        <ProtectedRoute requiredRole="admin">
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900 transition-all duration-500">
                <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-6rem)]">
                        <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
                            <div className="space-y-4 sm:space-y-6">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                                    Register a
                                    <span className="block bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                                        New Room
                                    </span>
                                </h1>
                                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                                    Add new Rooms onto the platform
                                </p>
                                <div className="space-y-4 sm:space-y-6">
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-700/50 dark:hover:bf-gray-800/80 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                                            <div className="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">{feature.title}</h3>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 w-full max-w-md mx-auto">
                                <div className="text-center mb-6 sm:mb-8">
                                    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Building2 className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Register Room
                                    </h2>
                                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                        Fill in the details below
                                    </p>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="text" name="roomname" placeholder="Room Name" value={formData.roomname} onChange={handleInputChange} disabled={addRoomMutation.isPending} className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400" required />
                                    </div>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="text" name="roomlocation" placeholder="Room Location" value={formData.roomlocation} onChange={handleInputChange} disabled={addRoomMutation.isPending} className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400" required />
                                    </div>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="text" name="capacity" placeholder="Room Capacity" value={formData.capacity} onChange={handleInputChange} disabled={addRoomMutation.isPending} className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400" required />
                                    </div>
                                    <div className="relative">
                                        <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input type="text" placeholder="Search and add equipment..." value={equipmentSearch} onChange={(e) => { setEquipmentSearch(e.target.value); setShowEquipmentDropdown(true); }} onFocus={() => setShowEquipmentDropdown(true)} disabled={addRoomMutation.isPending} className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400" />
                                        {showEquipmentDropdown && equipmentSearch && (
                                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                {filteredEquipment.length > 0 ? (
                                                    filteredEquipment.map((equipment) => (
                                                        <button key={equipment} type="button" onClick={() => addEquipmentHandler(equipment)} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm">
                                                            <div className="font-medium text-gray-800 dark:text-gray-200">{equipment}</div>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No equipment found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {formData.equipment.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Equipment ({formData.equipment.length})</label>
                                            <div className="flex flex-wrap gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                                {formData.equipment.map((equipment) => (
                                                    <div key={equipment} className="flex items-center bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm">
                                                        {equipment}
                                                        <button type="button" onClick={() => removeEquipment(equipment)} disabled={addRoomMutation.isPending} className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400">✕</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <button type="submit" disabled={addRoomMutation.isPending} className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-2.5 sm:py-3 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800 transition-all duration-300">
                                        {addRoomMutation.isPending ? 'Registering...' : 'Register Room'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default RegisterRoomPage;