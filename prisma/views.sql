CREATE OR REPLACE VIEW GodsAmountByPlayers
AS
SELECT DISTINCT "PlayersSkins"."playerId", "Guilds"."id" as "guildId", count(distinct "Gods"."id")
FROM "PlayersSkins", "Skins", "Gods", "Guilds", "Players"
WHERE "PlayersSkins"."skinId" = "Skins"."id"
AND "Skins"."godId" = "Gods"."id"
and "Players"."id" = "PlayersSkins"."playerId"
and "Players"."guildId" = "Guilds"."id"
AND "Guilds"."id" = "Players"."guildId" 
GROUP BY "Guilds"."id", "PlayersSkins"."playerId"
ORDER BY 3 DESC;

CREATE OR REPLACE VIEW PlayerSkinsAmountByGod
AS
select gu.id as "guildId", p.id as "playerId", g.id as "godId", count(s.id) as "skinsAmount"
from "Guilds" gu, "Players" p, "PlayersSkins" ps, "Skins" s, "Gods" g
where gu.id = p."guildId"
and p.id = ps."playerId"
and ps."skinId" = s.id 
and s."godId" = g.id
group by 1, 2, 3
order by 4 desc;

CREATE OR REPLACE VIEW GodSkinsFullNames
AS
select '"' || "Skins"."name" || '" ' || "Gods"."name" as "fullName", "Gods"."id" as "godId", "Skins"."id" as "skinId"
from "Skins", "Gods"
where "Skins"."godId" = "Gods"."id"
group by "Gods"."name", "Skins"."name", "Skins"."id", "Gods"."id"
order by "Gods"."name", "Skins"."name";

-- Role by players
CREATE OR REPLACE VIEW HunterGodsByPlayers
AS
select gu.id as "guildId", p.id as "playerId", count(distinct g.id) as "godsAmount"
from "Guilds" gu, "Players" p, "PlayersSkins" ps, "Skins" s, "Gods" g
where gu.id = p."guildId"
and p.id = ps."playerId"
and ps."skinId" = s.id 
and s."godId" = g.id
and g.roles = 'Hunter'
group by 1, 2
order by 3 desc;

CREATE OR REPLACE VIEW GuardianGodsByPlayers
AS
select gu.id as "guildId", p.id as "playerId", count(distinct g.id) as "godsAmount"
from "Guilds" gu, "Players" p, "PlayersSkins" ps, "Skins" s, "Gods" g
where gu.id = p."guildId"
and p.id = ps."playerId"
and ps."skinId" = s.id 
and s."godId" = g.id
and g.roles = 'Guardian'
group by 1, 2
order by 3 desc;

CREATE OR REPLACE VIEW AssassinGodsByPlayers
AS
select gu.id as "guildId", p.id as "playerId", count(distinct g.id) as "godsAmount"
from "Guilds" gu, "Players" p, "PlayersSkins" ps, "Skins" s, "Gods" g
where gu.id = p."guildId"
and p.id = ps."playerId"
and ps."skinId" = s.id 
and s."godId" = g.id
and g.roles = 'Assassin'
group by 1, 2
order by 3 desc;

CREATE OR REPLACE VIEW MageGodsByPlayers
AS
select gu.id as "guildId", p.id as "playerId", count(distinct g.id) as "godsAmount"
from "Guilds" gu, "Players" p, "PlayersSkins" ps, "Skins" s, "Gods" g
where gu.id = p."guildId"
and p.id = ps."playerId"
and ps."skinId" = s.id 
and s."godId" = g.id
and g.roles = 'Mage'
group by 1, 2
order by 3 desc;

CREATE OR REPLACE VIEW WarriorGodsByPlayers
AS
select gu.id as "guildId", p.id as "playerId", count(distinct g.id) as "godsAmount"
from "Guilds" gu, "Players" p, "PlayersSkins" ps, "Skins" s, "Gods" g
where gu.id = p."guildId"
and p.id = ps."playerId"
and ps."skinId" = s.id 
and s."godId" = g.id
and g.roles = 'Warrior'
group by 1, 2
order by 3 desc;