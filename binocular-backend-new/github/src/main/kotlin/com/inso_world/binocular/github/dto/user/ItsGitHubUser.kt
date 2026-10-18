package com.inso_world.binocular.github.dto.user

import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Platform
import com.inso_world.binocular.model.Project

data class ItsGitHubUser(
    val id: String, // GitHub-ID for user
    val login: String,
    val email: String?,
    val name: String?,
    val url: String?,
    val avatarUrl: String?
) {
    fun toDomain(project: Project): Account {
        val acc =
            Account(
                gid = this.id,
                login = this.login,
                platform = Platform.GitHub,
                projectIds = mutableSetOf(project.iid),
            ).apply {
                this.name = this@ItsGitHubUser.name
                this.url = this@ItsGitHubUser.url
                this.avatarUrl = this@ItsGitHubUser.avatarUrl
            }
        return acc
    }
}
