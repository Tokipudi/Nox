CREATE OR REPLACE VIEW GodsAmountByPlayers
AS
SELECT DISTINCT "PlayersSkins"."playerId", "Guilds"."id" as "guildId", count("Skins"."godId")
FROM "PlayersSkins", "Skins", "Gods", "Guilds", "Players"
WHERE "PlayersSkins"."skinId" = "Skins"."id"
AND "Skins"."godId" = "Gods"."id"
and "Players"."id" = "PlayersSkins"."playerId"
and "Players"."guildId" = "Guilds"."id"
AND "Guilds"."id" = "Players"."guildId" 
GROUP BY "Guilds"."id", "PlayersSkins"."playerId"
ORDER BY 3 DESC;

CREATE OR REPLACE VIEW GodSkinsFullNames
AS
select '"' || "Skins"."name" || '" ' || "Gods"."name" as "fullName", "Gods"."id" as "godId", "Skins"."id" as "skinId"
from "Skins", "Gods"
where "Skins"."godId" = "Gods"."id"
group by "Gods"."name", "Skins"."name", "Skins"."id", "Gods"."id"
order by "Gods"."name", "Skins"."name";