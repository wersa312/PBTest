module.exports = (id, mafia) => {
    mafia.dead[id] = JSON.parse(JSON.stringify(mafia.users[id]));
    delete mafia.users[id];
};