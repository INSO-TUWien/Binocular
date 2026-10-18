package com.inso_world.binocular.cli

import com.inso_world.binocular.core.delegates.logger
import org.springframework.boot.WebApplicationType
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.builder.SpringApplicationBuilder
import org.springframework.context.ApplicationContextInitializer
import org.springframework.context.ConfigurableApplicationContext
import org.springframework.context.annotation.ComponentScan
import org.springframework.shell.command.annotation.CommandScan

@SpringBootApplication
@CommandScan(basePackages = ["com.inso_world.binocular.cli.commands"])
@ComponentScan(
    basePackages = [
        "com.inso_world.binocular.cli",
//        make sure the ones below match the ones in WebApplication (and vice versa)
        "com.inso_world.binocular.core.persistence",
        "com.inso_world.binocular.core.service",
        "com.inso_world.binocular.github",
    ],
)
internal class BinocularCommandLineApplication {
    companion object {
        private val logger by logger()
    }

//  @Bean
//  fun myPromptProvider(): PromptProvider {
//    return PromptProvider {
//      AttributedString(
//        "binocular-shell:>",
//        AttributedStyle.DEFAULT.foreground(AttributedStyle.YELLOW)
//      )
//    }
//  }
}

fun main(args: Array<String>) {
    var webType = WebApplicationType.NONE

    val initializer =
        ApplicationContextInitializer<ConfigurableApplicationContext> { ctx ->
            val env = ctx.environment
            if (env.activeProfiles.contains("h2")) {
                webType = WebApplicationType.SERVLET
            }
        }

    SpringApplicationBuilder(BinocularCommandLineApplication::class.java)
        .initializers(initializer)
        .web(webType)
        .run(*args)
}
