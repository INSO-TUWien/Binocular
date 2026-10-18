package com.inso_world.binocular.cli.integration.shell

import com.inso_world.binocular.cli.integration.shell.base.BaseShellNoDataTest
import org.awaitility.Awaitility
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertAll
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.shell.test.ShellAssertions
import org.springframework.shell.test.ShellTestClient
import java.util.concurrent.TimeUnit

internal class BuiltinCommands
    @Autowired
    constructor(
        val client: ShellTestClient,
    ) : BaseShellNoDataTest() {
        private lateinit var session: ShellTestClient.InteractiveShellSession

        @BeforeEach
        fun beforeEach() {
            session = client.interactive().run()
        }

        @Test
        fun `session running`() {
            assertFalse(session.isComplete)
        }

        @Test
        fun `context loads`() {
            Awaitility.await().atMost(2, TimeUnit.SECONDS).untilAsserted({
                ShellAssertions
                    .assertThat(session.screen())
                    .containsText("shell:>")
            })
        }

        @Test
        fun `help shows AVAILABLE COMMANDS`() {
            session.write(
                session
                    .writeSequence()
                    .text("help")
                    .carriageReturn()
                    .build(),
            )

            Awaitility.await().atMost(5, TimeUnit.SECONDS).untilAsserted {
                assertAll(
                    { ShellAssertions.assertThat(session.screen()).containsText("AVAILABLE COMMANDS") },
                    { ShellAssertions.assertThat(session.screen()).containsText("Index Commands") },
                    { ShellAssertions.assertThat(session.screen()).containsText("index commits") },
                    { ShellAssertions.assertThat(session.screen()).containsText("index blames") },
                    // { ShellAssertions.assertThat(session.screen()).containsText("index diffs") },
                    { ShellAssertions.assertThat(session.screen()).containsText("index issues") },
                )
            }
        }
    }
