@ECHO OFF
@SETLOCAL EnableDelayedExpansion

@REM ============================================================
@REM  Apache Maven Wrapper for FutureMeal Backend
@REM  - Handles JAVA_HOME ending in \bin (auto-corrects)
@REM  - Loads .env file as system properties for Spring Boot
@REM  - Works with paths containing spaces
@REM ============================================================

@SET "__DIR=%~dp0"
@IF "!__DIR:~-1!"=="\" SET "__DIR=!__DIR:~0,-1!"
@SET "MAVEN_PROJECTBASEDIR=!__DIR!"
@SET "WRAPPER_JAR=!__DIR!\.mvn\wrapper\maven-wrapper.jar"
@SET "WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain"

@REM ── Validate Wrapper JAR ──────────────────────────────────────────────────
@IF NOT EXIST "!WRAPPER_JAR!" (
    @ECHO.
    @ECHO ERROR: Maven Wrapper JAR not found: !WRAPPER_JAR!
    @ECHO Run this in PowerShell to download it:
    @ECHO   Invoke-WebRequest -Uri https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar -OutFile .mvn\wrapper\maven-wrapper.jar
    @ECHO.
    @ENDLOCAL & EXIT /B 1
)

@REM ── Fix JAVA_HOME: strip trailing \bin if present ─────────────────────────
@SET "_JH=!JAVA_HOME!"
@IF "!_JH:~-1!"=="\" SET "_JH=!_JH:~0,-1!"
@SET "_LAST4=!_JH:~-4!"
@IF /I "!_LAST4!"=="\bin" SET "_JH=!_JH:~0,-4!"
@SET "JAVA_HOME=!_JH!"
@SET "JAVA_EXE=!JAVA_HOME!\bin\java.exe"

@IF NOT EXIST "!JAVA_EXE!" (
    @ECHO ERROR: java.exe not found at !JAVA_EXE!
    @ECHO Set JAVA_HOME to the JDK root, e.g.: C:\Program Files\Java\jdk-22
    @ENDLOCAL & EXIT /B 1
)

@REM ── Load .env file: each KEY=VALUE becomes -DKEY=VALUE ────────────────────
@SET "ENV_PROPS="
@SET "ENV_FILE=!MAVEN_PROJECTBASEDIR!\.env"
@IF EXIST "!ENV_FILE!" (
    @FOR /F "usebackq tokens=1* delims== eol=#" %%K IN ("!ENV_FILE!") DO (
        @SET "%%K=%%L"
        @SET "ENV_PROPS=!ENV_PROPS! -D%%K=%%L"
    )
)

@REM ── Launch Maven Wrapper ──────────────────────────────────────────────────
@ECHO OFF
"!JAVA_EXE!" ^
    "-Dmaven.multiModuleProjectDirectory=!MAVEN_PROJECTBASEDIR!" ^
    !ENV_PROPS! ^
    -classpath "!WRAPPER_JAR!" ^
    %WRAPPER_LAUNCHER% %*

@ENDLOCAL & EXIT /B %ERRORLEVEL%
