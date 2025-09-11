'use client'
import React, { useEffect, useState } from "react";
import { X, Check, Edit, Building2, MapPin, Users, Monitor } from 'lucide-react';
import { roomService, type Room } from "../api/room.service";
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
    onUpdateSuccess?: (updatedRoom: Room) => void;
}

const availableEquipment = [
    "WiFi",
    "Projector", 
    "Smart TV",
    "Sound System",
    "AC",
    "Lighting",
    "Whiteboard",
    "Chair",
    "Desk",
    "Long Table",
    "Microphone",
    "Speaker",
];

const UpdateRoomModal: React.FC<UpdateRoomModalProps> = ({ 
    isOpen, 
    onClose, 
    roomid, 
    onUpdateSuccess 
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [originalRoom, setOriginalRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);

    const [equipmentSearch, setEquipmentSearch] = useState("");
    const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);

    const [updateForm, setUpdateForm] = useState<UpdateRoomForm>({
        roomname: '',
        roomlocation: '',
        capacity: '',
        equipment: [],
    });

    useEffect(() => {
        const fetchRoom = async () => {
            if (!isOpen || !roomid) return;
            
            setLoading(true);
            try {
                const response = await roomService.getAllRooms();
                const room = response.rooms.find(r => r.roomid === roomid);
                
                if (room) {
                    setOriginalRoom(room);
                    setUpdateForm({
                        roomname: room.roomname,
                        roomlocation: room.roomlocation,
                        capacity: room.capacity.toString(), 
                        equipment: room.equipment,
                    });
                } else {
                    setError('Room not found');
                }
            } catch (err: any) {
                setError('Failed to fetch room data: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRoom();
    }, [isOpen, roomid]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === 'capacity') {
            if (value === '' || /^\d+$/.test(value)) {
                setUpdateForm(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        } else {
            setUpdateForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        if (error) setError('');
        if (success) setSuccess(false);
    };

    const addEquipment = (equipment: string) => {
        if (!updateForm.equipment.includes(equipment)) {
            setUpdateForm(prev => ({
                ...prev,
                equipment: [...prev.equipment, equipment]
            }));
        }
        setEquipmentSearch("");
        setShowEquipmentDropdown(false);
    };

    const removeEquipment = (equipmentToRemove: string) => {
        setUpdateForm(prev => ({
            ...prev,
            equipment: prev.equipment.filter(eq => eq !== equipmentToRemove)
        }));
    };

    const filteredEquipment = availableEquipment.filter(equipment =>
        equipment.toLowerCase().includes(equipmentSearch.toLowerCase()) &&
        !updateForm.equipment.includes(equipment)
    );

    const validateForm = (): boolean => {
        if (!updateForm.roomname.trim()) {
            setError('Room Name is required');
            return false;
        }

        if (!updateForm.roomlocation.trim()) {
            setError('Room location is required');
            return false;
        }

        const capacityNumber = parseInt(updateForm.capacity);
        if (!updateForm.capacity.trim() || isNaN(capacityNumber) || capacityNumber <= 0) {
            setError('Please enter a valid Room capacity (greater than 0)');
            return false;
        }

        if (updateForm.equipment.length === 0) {
            setError('Please add at least one piece of equipment');
            return false;
        }

        if (originalRoom && 
            updateForm.roomname === originalRoom.roomname &&
            updateForm.roomlocation === originalRoom.roomlocation &&
            capacityNumber === originalRoom.capacity &&
            JSON.stringify(updateForm.equipment.sort()) === JSON.stringify(originalRoom.equipment.sort())
        ) {
            setError('No changes detected. Please modify at least one field.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(false);
        setError('');

        if (!validateForm()) {
            return;
        }

        setShowConfirm(true);
    };

    const handleConfirmUpdate = async () => {
        setIsSubmitting(true);
        setShowConfirm(false);

        try {
            const updateData = {
                roomname: updateForm.roomname,
                roomlocation: updateForm.roomlocation,
                capacity: parseInt(updateForm.capacity), 
                equipment: updateForm.equipment
            };

            console.log('Updating room with ID:', roomid, 'Data:', updateData);
            const result = await roomService.updateRoom(roomid, updateData);

            if (result.success) {
                toast.success("Room updated successfully");
                console.log('Room updated successfully');
                setSuccess(true);
                
                const updatedRoom: Room = {
                    ...originalRoom!,
                    ...updateData,
                    roomid: roomid
                };

                if (onUpdateSuccess) {
                    onUpdateSuccess(updatedRoom);
                }
                setOriginalRoom(updatedRoom);
            } else {
                setError(result.message || 'Failed to update room');
            }
        } catch (err: any) {
            console.error("Update failed", err);
            setError(err.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setError('');
            setSuccess(false);
            setShowConfirm(false);
            setEquipmentSearch('');
            setShowEquipmentDropdown(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-800 dark:to-red-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                <div className="p-6 sm:p-8 border-b border-gray-200/50 dark:border-gray-700/50 relative">
                    <button 
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="absolute right-4 top-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                    
                    <div className="text-center">
                        <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Edit className="w-6 sm:w-8 h-6 sm:h-8 text-white"/>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Update Room
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            Modify Room information
                        </p>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-xl">
                                    <p className="text-red-700 dark:text-red-300 text-sm">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="text"
                                        name="roomname"
                                        placeholder="Room Name"
                                        value={updateForm.roomname}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="text"
                                        name="roomlocation"
                                        placeholder="Location of Room"
                                        value={updateForm.roomlocation}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="text"
                                        name="capacity"
                                        placeholder="Room capacity"
                                        value={updateForm.capacity}
                                        onChange={handleInputChange}
                                        disabled={isSubmitting}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search and add equipment..."
                                        value={equipmentSearch}
                                        onChange={(e) => {
                                            setEquipmentSearch(e.target.value);
                                            setShowEquipmentDropdown(true);
                                        }}
                                        onFocus={() => setShowEquipmentDropdown(true)}
                                        disabled={isSubmitting}
                                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />

                                    {showEquipmentDropdown && equipmentSearch && (
                                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                            {filteredEquipment.length > 0 ? (
                                                filteredEquipment.map((equipment) => (
                                                    <button
                                                        key={equipment}
                                                        type="button"
                                                        onClick={() => addEquipment(equipment)}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors duration-300"
                                                    >
                                                        <div className="font-medium text-gray-800 dark:text-gray-200">
                                                            {equipment}
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                                    No equipment found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {updateForm.equipment.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Selected Equipment ({updateForm.equipment.length})
                                        </label>
                                        <div className="flex flex-wrap gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                            {updateForm.equipment.map((equipment) => (
                                                <div
                                                    key={equipment}
                                                    className="flex items-center bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm transition-all duration-300"
                                                >
                                                    {equipment}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEquipment(equipment)}
                                                        disabled={isSubmitting}
                                                        className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 disabled:opacity-50 transition-colors duration-300"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {showConfirm ? (
                                    <div className="flex flex-col gap-4 pt-4">
                                        <p className="text-sm text-center text-gray-700 dark:text-gray-300 mb-2">
                                            Are you sure you want to update this room?
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleConfirmUpdate}
                                                disabled={isSubmitting}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? "Updating..." : "Confirm Update"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(false)}
                                                disabled={isSubmitting}
                                                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-all duration-300 text-sm disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 pt-4">
                                        <button 
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-2.5 sm:py-3 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            Update Room
                                        </button>
                                    </div>
                                )}
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdateRoomModal;