function generateMatches(users) {
    // Filter out admin users and create a copy of the array
    const eligibleUsers = users.filter(u => !u.isAdmin).map(u => ({...u}));
    
    if (eligibleUsers.length < 2) {
        throw new Error('Need at least 2 non-admin users to generate matches');
    }

    // Clear existing matches
    users.forEach(user => {
        if (user.matchedWith !== null) {
            user.matchedWith = null;
        }
    });

    // Fisher-Yates shuffle
    for (let i = eligibleUsers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [eligibleUsers[i], eligibleUsers[j]] = [eligibleUsers[j], eligibleUsers[i]];
    }

    // Assign matches in a circle
    for (let i = 0; i < eligibleUsers.length; i++) {
        const nextIndex = (i + 1) % eligibleUsers.length;
        const currentUser = users.find(u => u.id === eligibleUsers[i].id);
        if (currentUser) {
            currentUser.matchedWith = eligibleUsers[nextIndex].id;
        }
    }

    return users;
}

module.exports = { generateMatches }; 