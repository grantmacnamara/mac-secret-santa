class User {
    constructor(username, password, isAdmin = false) {
        this.id = Date.now();
        this.username = username;
        this.password = password;
        this.isAdmin = isAdmin;
        this.ready = false;
        this.likes = [];
        this.dislikes = [];
        this.matchedWith = null;
    }

    setPreferences(likes, dislikes) {
        this.likes = likes;
        this.dislikes = dislikes;
        this.ready = true;
    }

    setMatch(userId) {
        this.matchedWith = userId;
    }

    clearMatch() {
        this.matchedWith = null;
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            password: this.password,
            isAdmin: this.isAdmin,
            ready: this.ready,
            likes: this.likes,
            dislikes: this.dislikes,
            matchedWith: this.matchedWith
        };
    }
}

module.exports = User; 