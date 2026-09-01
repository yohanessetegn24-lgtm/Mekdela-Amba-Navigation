# .NET SDK በመጠቀም ፕሮጀክቱን Build ለማድረግ
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build-env
WORKDIR /app

# Copy everything and restore
COPY . ./
RUN dotnet restore

# Build and publish a release
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build-env /app/out .

# የፕሮጀክትህን ስም እዚህ ጋር ተካ (ለምሳሌ MyApi.dll)
ENTRYPOINT ["dotnet", "MekdelaAmbaCampusNavigation.API.dll"]