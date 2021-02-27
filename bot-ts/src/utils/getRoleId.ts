import { Snowflake, Role } from "discord.js";

interface getRoleIdReturn {
  roleId: Snowflake;
  isEveryoneRole: boolean;
}
/**
 * Gets the role ID for a role. Returns '@everyone' if it's the '@everyone' role
 */
const getRoleId = (role: Role): getRoleIdReturn => {
  const isEveryoneRole = role.name === "@everyone";
  const roleId = isEveryoneRole ? "@everyone" : role.id;

  return { roleId, isEveryoneRole };
};

export default getRoleId;
