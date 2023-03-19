#!/usr/bin/env node
const axios = require('axios')

const instance = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com/'
})

const restAPI = {
    getUsers() {
        return instance.get('users')
    },
    getPosts() {
        return instance.get('posts')
    },
    getComments(postId) {
        return instance.get(`posts/${postId}/comments`)
    }
}

const getUsers = async () => {
    const response = await restAPI.getUsers()
    return response.data
}

const getPosts = async () => {
    const response = await restAPI.getPosts()
    return response.data
}
const getComments = async (postId) => {
    const response = await restAPI.getComments(postId)
    return response.data
}

//username arg for append comments
const formData = async (userName = null) => {
    const usersFromServer = await getUsers().catch(e => {throw new Error(e)})
    const postsFromServer = await getPosts().catch(e => {throw new Error(e)})
    const users = usersFromServer.map(u => {
        const posts = postsFromServer.filter(post => post.userId === u.id).map(p => ({
            id: p.id,
            title: p.title,
            title_crop: p.title.slice(0, 20) + '...',
            body: p.body
        }))
        return {
            id: u.id,
            name: u.name,
            email: u.email,
            address: `${u.address.city}, ${u.address.street}, ${u.address.suite}`,
            website: `https://${u.website}`,
            company: u.company.name,
            posts,
        }
    })
    await appendCommentsToUser(users, userName).catch(e => {throw new Error(e)})
    return users
}
const appendCommentsToUser = async (users, userName) => {
    for (const user of users) {
        if (user.name === userName) {
            user.posts = await Promise.all(user.posts.map(async p => {
                const comments = await getComments(p.id).catch(e => {throw new Error(e)})
                return {...p, comments}
            }))
        }
    }
    return users
}
formData('Ervin Howell').then(users => console.dir(users.filter(u => u.id <= 10), {depth: Infinity}))