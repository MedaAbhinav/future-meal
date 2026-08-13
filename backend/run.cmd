@ECHO OFF
@SETLOCAL EnableDelayedExpansion

@REM ============================================================
@REM  FutureMeal Backend - Start Script for Windows
@REM  Loads .env file and launches Spring Boot via Maven Wrapper
@REM ============================================================

@SET "__DIR=%~dp0"
@IF "!__DIR:~-1!"=="\" SET "__DIR=!__DIR:~0,-1!"

@ECHO Starting FutureMeal Backend...
@ECHO.

@REM ── Fix JAVA_HOME if it points to \bin ──────────────────────
@SET "_JH=!JAVA_HOME!"
@IF "!_JH:~-1!"=="\" SET "_JH=!_JH:~0,-1!"
@IF /I "!_JH:~-4!"=="\bin" SET "_JH=!_JH:~0,-4!"
@SET "JAVA_HOME=!_JH!"
@ECHO Using JAVA_HOME: !JAVA_HOME!

@REM ── Load .env file ──────────────────────────────────────────
@SET "ENV_FILE=!__DIR!\.env"
@IF EXIST "!ENV_FILE!" (
    @ECHO Loading environment from .env...
    @FOR /F "usebackq tokens=1,2 delims== eol=#" %%A IN ("!ENV_FILE!") DO (
        @SET "%%A=%%B"
    )
) ELSE (
    @ECHO WARNING: .env file not found. Using application.yml defaults.
)

@ECHO.
@ECHO DB_URL:    !DB_URL!
@ECHO SERVER:    Port !SERVER_PORT!
@ECHO.

@REM ── Run Spring Boot ──────────────────────────────────────────
"!__DIR!\mvnw.cmd" spring-boot:run

@ENDLOCAL
