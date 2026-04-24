export type ValidatedEnv = {
    DATABASE_URL: string,
    PORT: number,
    NODE_ENV: string,
    JWT_SECRET: string,
    JWT_EXPIRES_IN: string,
    REFRESH_TOKEN_SECRET: string,
    REFRESH_TOKEN_EXPIRY: string,
    REFRESH_TOKEN_LENGTH: number,
    SALT_ROUNDS: number,
    LOG_LEVEL: string,
}

export interface EnvConfig {
    [key : string ]: {
        required?: boolean;
        validator?: (value: string) => boolean | string;
        transformer?: (value: string) => unknown;
    };
}
