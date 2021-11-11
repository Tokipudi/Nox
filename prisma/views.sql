CREATE OR REPLACE VIEW GodsAmountByPlayers
AS
SELECT DISTINCT "PlayersSkins"."guildId", "PlayersSkins"."userId", count("Skins"."godId")
FROM "PlayersSkins", "Skins", "Gods", "Guilds"
WHERE "PlayersSkins"."skinId" = "Skins"."id"
AND "Skins"."godId" = "Gods"."id" 
AND "Guilds"."id" = "PlayersSkins"."guildId" 
GROUP BY "PlayersSkins"."guildId", "PlayersSkins"."userId"
ORDER BY 3 DESC;