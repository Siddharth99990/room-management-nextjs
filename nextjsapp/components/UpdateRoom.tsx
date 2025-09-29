'use client'
import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Edit, Building2, MapPin, Users, Monitor } from 'lucide-react';
import { roomService, type UpdateRoomData } from "../api/room.service";
import { useRoomStore } from "@/stores/roomStore";
import toast from "react-hot-toast";

interface UpdateRoomForm {
    roomname: string;
    roomlocation: string;
    capacity: string;
    equipment: string[];
}

interface UpdateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomid: number;
    onUpdateSuccess?: () => void; // Optional: Can be simplified as it's handled by invalidation
}

const availableEquipment = [
    "WiFi", "Projector", "Smart TV", "Sound System", "AC", "Lighting",
    "Whiteboard", "Chair", "Desk", "Long Table", "Microphone", "Speaker",
];

const UpdateRoomModal: React.FC<UpdateRoomModalProps> = ({ isOpen, onClose, roomid, onUpdateSuccess }) => {
    const queryClient = useQueryClient();
    const { updateRoom } = useRoomStore();
    const [showConfirm, setShowConfirm] = useState(false);
    const [equipmentSearch, setEquipmentSearch] = useState("");
    const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);
    const [updateForm, setUpdateForm] = useState<UpdateRoomForm>({
        roomname: '',
        roomlocation: '',
        capacity: '',
        equipment: [],
    });

    const { data: room, isLoading: isLoadingRoom } = useQuery({
        queryKey: ['room', roomid],
        queryFn: () => roomService.getRoomById(roomid).then(res => res.room),
        enabled: isOpen,
    });

    // Populate form when data is fetched
    useEffect(() => {
        if (room) {
            setUpdateForm({
                roomname: room.roomname,
                roomlocation: room.roomlocation,
                capacity: room.capacity.toString(),
                equipment: room.equipment,
            });
        }
    }, [room]);

    const updateRoomMutation = useMutation({
        mutationFn: (data: UpdateRoomData) => updateRoom(roomid, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            queryClient.invalidateQueries({ queryKey: ['room', roomid] });
            onUpdateSuccess?.();
            onClose();
        },
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'capacity' && value !== '' && !/^\d+$/.test(value)) return;
        setUpdateForm(prev => ({ ...prev, [name]: value }));
    };

    const addEquipment = (equipment: string) => {
        if (!updateForm.equipment.includes(equipment)) {
            setUpdateForm(prev => ({ ...prev, equipment: [...prev.equipment, equipment] }));
        }
        setEquipmentSearch("");
        setShowEquipmentDropdown(false);
    };

    const removeEquipment = (equipmentToRemove: string) => {
        setUpdateForm(prev => ({ ...prev, equipment: prev.equipment.filter(eq => eq !== equipmentToRemove) }));
    };

    const filteredEquipment = availableEquipment.filter(equipment =>
        equipment.toLowerCase().includes(equipmentSearch.toLowerCase()) &&
        !updateForm.equipment.includes(equipment)
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const handleConfirmUpdate = () => {
        const capacityNumber = parseInt(updateForm.capacity);
        if (!updateForm.roomname.trim() || !updateForm.roomlocation.trim() || isNaN(capacityNumber) || capacityNumber <= 0 || updateForm.equipment.length === 0) {
            toast.error("Please fill all required fields correctly.");
            setShowConfirm(false);
            return;
        }
        updateRoomMutation.mutate({ ...updateForm, capacity: capacityNumber });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-red-800 rounded-3xl shadow-2xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                <div className="p-6 sm:p-8 border-b border-gray-200/50 dark:border-gray-700/50 relative">
                    <button onClick={onClose} disabled={updateRoomMutation.isPending} className="absolute right-4 top-4 p-2 rounded-lg text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Edit className="w-6 h-6 text-white" /></div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Update Room</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Modify Room information</p>
                    </div>
                </div>
                <div className="p-6 sm:p-8">
                    {isLoadingRoom ? <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div> : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                             <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" name="roomname" placeholder="Room Name" value={updateForm.roomname} onChange={handleInputChange} disabled={updateRoomMutation.isPending} className="w-full pl-11 pr-4 py-2.5 border rounded-xl" required />
                            </div>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" name="roomlocation" placeholder="Location of Room" value={updateForm.roomlocation} onChange={handleInputChange} disabled={updateRoomMutation.isPending} className="w-full pl-11 pr-4 py-2.5 border rounded-xl" required />
                            </div>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" name="capacity" placeholder="Room capacity" value={updateForm.capacity} onChange={handleInputChange} disabled={updateRoomMutation.isPending} className="w-full pl-11 pr-4 py-2.5 border rounded-xl" required />
                            </div>
                            <div className="relative">
                                <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" placeholder="Search and add equipment..." value={equipmentSearch} onChange={(e) => { setEquipmentSearch(e.target.value); setShowEquipmentDropdown(true); }} onFocus={() => setShowEquipmentDropdown(true)} disabled={updateRoomMutation.isPending} className="w-full pl-11 pr-4 py-2.5 border rounded-xl" />
                                {showEquipmentDropdown && equipmentSearch && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                        {filteredEquipment.length > 0 ? (
                                            filteredEquipment.map((equipment) => (
                                                <button key={equipment} type="button" onClick={() => addEquipment(equipment)} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                                                    <div className="font-medium">{equipment}</div>
                                                </button>
                                            ))
                                        ) : <div className="px-4 py-2 text-sm text-gray-500">No equipment found</div>}
                                    </div>
                                )}
                            </div>
                            {updateForm.equipment.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Selected Equipment ({updateForm.equipment.length})</label>
                                    <div className="flex flex-wrap gap-2 p-3 border rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                        {updateForm.equipment.map((equipment) => (
                                            <div key={equipment} className="flex items-center bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm">
                                                {equipment}
                                                <button type="button" onClick={() => removeEquipment(equipment)} disabled={updateRoomMutation.isPending} className="ml-2 text-red-500 hover:text-red-700">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {showConfirm ? (
                                <div className="flex flex-col gap-4 pt-4">
                                    <p className="text-sm text-center">Are you sure you want to update this room?</p>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={handleConfirmUpdate} disabled={updateRoomMutation.isPending} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg">{updateRoomMutation.isPending ? "Updating..." : "Confirm Update"}</button>
                                        <button type="button" onClick={() => setShowConfirm(false)} disabled={updateRoomMutation.isPending} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-3 pt-4">
                                    <button type="submit" disabled={updateRoomMutation.isPending} className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-2.5 rounded-xl font-semibold">Update Room</button>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdateRoomModal;