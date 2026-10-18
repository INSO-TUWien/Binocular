package com.inso_world.binocular.github.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

@Configuration
open class WebClientConfig {
    @Bean
    open fun webClient(): WebClient =
        WebClient
            .builder()
            .build()
}
