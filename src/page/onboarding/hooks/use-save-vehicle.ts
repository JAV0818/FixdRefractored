import { useMutation } from "@tanstack/react-query";

import { useAuthContext } from "@/providers/auth-provider";
import { userService } from "@/services/user-service";

type VehicleInput = {
  make: string;
  model: string;
  year: string;
  color?: string;
  licensePlate?: string;
};

export const useSaveVehicle = () => {
  const { currentUser } = useAuthContext();
  return useMutation({
    mutationFn: (vehicle: VehicleInput) => {
      if (!currentUser) throw new Error("Not authenticated");
      return userService.saveVehicle(currentUser.id, vehicle);
    },
  });
};
