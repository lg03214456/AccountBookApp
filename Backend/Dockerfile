# --- 第一階段：建置 (Build Stage) ---
# 使用微軟官方的 .NET 8 SDK 來編譯程式碼
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. 先複製 csproj 檔案並還原套件 (利用 Docker 快取機制加速)
COPY ["Backend.csproj", "./"]
RUN dotnet restore "Backend.csproj"

# 2. 複製剩餘的所有程式碼
COPY . .

# 3. 編譯並發布 (Publish) 為 Release 版本
RUN dotnet publish "Backend.csproj" -c Release -o /app/publish

# --- 第二階段：執行 (Runtime Stage) ---
# 使用輕量級的 .NET 8 Runtime 來執行 (檔案比較小)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# --- 設定 Cloud Run 專用端口 ---
# Cloud Run 預設會把流量打到 8080 Port
# 我們透過環境變數告訴 .NET 監聽 8080
ENV ASPNETCORE_HTTP_PORTS=8080

# 開放 Port (雖然只是宣告，但在 Docker 裡是好習慣)
EXPOSE 8080

# 啟動程式
ENTRYPOINT ["dotnet", "Backend.dll"]