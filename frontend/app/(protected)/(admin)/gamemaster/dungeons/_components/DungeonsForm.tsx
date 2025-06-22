"use client";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { Enemy } from "@prisma/client";

interface DungeonsFormProps {
  dungeonInfo: {
    name: string;
    enemies: {
      id: string;
      enemy: {
        name: string;
        icon: string;
        attack: number;
        maxHealth: number;
      };
      health: number;
    }[];
  };
  enemyTypes: Enemy[] | null;
}

function DungeonsForm({ dungeonInfo, enemyTypes }: DungeonsFormProps) {
  // const [special, setSpecial] = useState<string[]>(user.special);
  // const [enemy, setEnemy] = useState<Enemy[]>(
  //   dungeonInfo.enemies.map(
  //     (e) => enemyTypes?.find((et) => et.name === e.enemy.name) as Enemy,
  //   ) || [],
  // ); // Initialize with the array of Enemy objects or an empty array
  // const [name, setName] = useState<string | null>(user.name);
  // const [username, setUsername] = useState<string | null>(user.username);
  // const [lastname, setLastname] = useState<string | null>(user.lastname);

  // const router = useRouter();

  return (
    <>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        {dungeonInfo.name}
      </Typography>
      {dungeonInfo.enemies.map((enemy) => (
        <FormControl key={enemy.id} sx={{ marginX: 1, minWidth: 120 }}>
          <InputLabel>Enemy</InputLabel>
          <Select
            id="role"
            value={enemy.enemy.name}
            renderValue={(value) => (
              <div className="flex items-center">
                <img
                  src={enemy.enemy.icon}
                  alt={enemy.enemy.name}
                  className="w-6 h-6 mr-2"
                />
                {value}
              </div>
            )}
            // onChange={(event) => {
            //   const selected = enemyTypes?.find(
            //     (e) => e.id === Number(event.target.value),
            //   );
            //   if (selected) {
            //     setEnemy((prev) => {
            //       const updated = [...prev];
            //       updated[index] = selected;
            //       return updated;
            //     });
            //   }
            // }}
            label="Role"
          >
            {enemyTypes?.map((enemyType) => (
              <MenuItem key={enemyType.id} value={enemyType.id}>
                {enemyType.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
      {/* <Button
        variant="contained"
        color="primary"
        onClick={() => {
          // Check if any of the values have changed
          if (
            name !== user.name ||
            username !== user.username ||
            lastname !== user.lastname
          ) {
            adminUpdateUser(user.id, special, name, username, lastname);
            toast.success("User updated");
          } else {
            adminUpdateUser(user.id, special);
            toast.success("User updated");
          }
          if (role !== user.role) {
            updateRole(user.id, role);
            toast.success("User role updated");
          }
          router.refresh();
        }}
      >
        Update
      </Button> */}
    </>
  );
}

export default DungeonsForm;
