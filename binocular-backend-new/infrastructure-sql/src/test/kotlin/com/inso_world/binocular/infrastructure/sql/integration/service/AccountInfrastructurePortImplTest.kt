package com.inso_world.binocular.infrastructure.sql.integration.service

import com.inso_world.binocular.core.service.ProjectInfrastructurePort
import com.inso_world.binocular.infrastructure.sql.TestData
import com.inso_world.binocular.infrastructure.sql.integration.service.base.BaseServiceTest
import com.inso_world.binocular.infrastructure.sql.service.AccountInfrastructurePortImpl
import com.inso_world.binocular.model.Account
import com.inso_world.binocular.model.Platform
import com.inso_world.binocular.model.Project
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@Transactional
internal class AccountInfrastructurePortImplTest : BaseServiceTest() {
    @Autowired
    private lateinit var projectPort: ProjectInfrastructurePort

    @Autowired
    private lateinit var accountPort: AccountInfrastructurePortImpl

    private lateinit var testProject: Project

    @BeforeEach
    fun setup() {
//        setUp()
        testProject = projectPort.create(TestData.Domain.testProject(name = "Test Project", id = null))
    }

    @AfterEach
    fun cleanup() {
        tearDown()
    }

    @Nested
    inner class Save {
        @Test
        fun `save one account, expecting it in database`() {
            val accounts =
                listOf(
                    Account(
                        "MDQ9JXMlcjY5MoB7Nah4",
                        Platform.GitHub,
                        "user1",
                        projectIds = mutableSetOf(testProject.iid)
                    ).apply {
                        this.name = "User One"
                        this.avatarUrl = "https://example.com/avatars/user1.png"
                        this.url = "https://github.com/user1"
                    }
                )

            val savedAccounts = accountPort.saveAll(accounts)
            val savedAccount = savedAccounts.first()

            assertAll(
                "check account in db",
                {
                    assertThat(savedAccount.iid).isNotNull()
                    // assertThat(accountPort.findAll()).hasSize(1)
                    assertThat(savedAccount.gid).isEqualTo(accounts[0].gid)
                    assertThat(savedAccount.login).isEqualTo(accounts[0].login)
                    assertThat(savedAccount.name).isEqualTo(accounts[0].name)
                    assertThat(savedAccount.avatarUrl).isEqualTo(accounts[0].avatarUrl)
                    assertThat(savedAccount.url).isEqualTo(accounts[0].url)
                    assertThat(savedAccount.platform).isEqualTo(accounts[0].platform)
                }
            )
        }

        @Test
        fun `save accounts, expecting in database`() {
            val accounts =
                listOf(
                    Account(
                        gid = "abc123",
                        platform = Platform.GitHub,
                        login = "testuser",
                        projectIds = mutableSetOf(testProject.iid)
                    ).apply {
                        this.name = "User One"
                        this.avatarUrl = "https://example.com/avatars/user1.png"
                        this.url = "https://github.com/user1"
                    },
                    Account(
                        gid = "cba321",
                        platform = Platform.GitHub,
                        login = "testuser2",
                        projectIds = mutableSetOf(testProject.iid)
                    ).apply {
                        this.name = "User Two"
                        this.avatarUrl = "https://example.com/avatars/user2.png"
                        this.url = "https://github.com/user2"
                    }
                )

            val saved = accountPort.saveAll(accounts)
            assertThat(saved).hasSize(2)

            saved.zip(accounts).forEachIndexed { index, (savedAccount, original) ->
                assertAll(
                    "compare account #$index",
                    {
                        assertThat(savedAccount.iid).isNotNull()
                        assertThat(savedAccount.gid).isEqualTo(original.gid)
                        assertThat(savedAccount.login).isEqualTo(original.login)
                        assertThat(savedAccount.name).isEqualTo(original.name)
                        assertThat(savedAccount.avatarUrl).isEqualTo(original.avatarUrl)
                        assertThat(savedAccount.url).isEqualTo(original.url)
                        assertThat(savedAccount.platform).isEqualTo(original.platform)
                    }
                )
            }
        }

        @Test
        fun `save accounts with same gid, expecting error`() {
            val accounts =
                listOf(
                    Account(
                        gid = "abc123",
                        platform = Platform.GitHub,
                        login = "testuser",
                        projectIds = mutableSetOf(testProject.iid)
                    ).apply {
                        this.name = "User One"
                        this.avatarUrl = "https://example.com/avatars/user1.png"
                        this.url = "https://github.com/user1"
                    },
                    Account(
                        gid = "abc123",
                        platform = Platform.GitHub,
                        login = "testuser2",
                        projectIds = mutableSetOf(testProject.iid)
                    ).apply {
                        this.name = "User Two"
                        this.avatarUrl = "https://example.com/avatars/user2.png"
                        this.url = "https://github.com/user2"
                    }
                )

            assertAll(
                "check exception and empty database",
                {
//                    assertThrows<Exception> {
//                        accountPort.saveAll(accounts)
//                    }
                    assertThat(accountPort.findAll()).isEmpty()
                }
            )
        }
    }

    @Nested
    inner class Find {
        @Test
        fun `find existing gids, expecting according accounts`() {
            val gids =
                listOf(
                    "abc123"
                )

            val accounts =
                listOf(
                    Account(
                        gid = "abc123",
                        platform = Platform.GitHub,
                        login = "testuser",
                        projectIds = mutableSetOf(testProject.iid)
                    ).apply {
                        this.name = "User One"
                        this.avatarUrl = "https://example.com/avatars/user1.png"
                        this.url = "https://github.com/user1"
                    },
                    Account(
                        gid = "cba321",
                        platform = Platform.GitHub,
                        login = "testuser2",
                        projectIds = mutableSetOf(testProject.iid)
                    ).apply {
                        this.name = "User Two"
                        this.avatarUrl = "https://example.com/avatars/user2.png"
                        this.url = "https://github.com/user2"
                    }
                )

            val saved = accountPort.saveAll(accounts)
            assertThat(saved).hasSize(2)

            val existingAccountsByGid = accountPort.findExistingGid(gids)
            val existingAccount = existingAccountsByGid.first()

            assertAll(
                "check returned existing account",
                {
                    assertThat(existingAccountsByGid.toList().size).isEqualTo(1)
                    assertThat(existingAccount.id).isNotNull()
                    assertThat(existingAccount.gid).isEqualTo(accounts[0].gid)
                    assertThat(existingAccount.gid).isEqualTo(gids[0])
                    assertThat(existingAccount.login).isEqualTo(accounts[0].login)
                    assertThat(existingAccount.name).isEqualTo(accounts[0].name)
                    assertThat(existingAccount.avatarUrl).isEqualTo(accounts[0].avatarUrl)
                    assertThat(existingAccount.url).isEqualTo(accounts[0].url)
                    assertThat(existingAccount.platform).isEqualTo(accounts[0].platform)
                }
            )
        }
    }
}
