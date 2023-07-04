module.exports = (id, user, link = true) => {
    if (link) {
        return `@id${id} (${user.f_name.charAt(0)}. ${user.s_name})`;
    } else {
        return `${user.f_name.charAt(0)}. ${user.s_name}`;
    }
}