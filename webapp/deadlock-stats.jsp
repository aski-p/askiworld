<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.*, java.text.SimpleDateFormat, java.util.Date" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deadlock 통계 - JSP 버전</title>
    <link rel="stylesheet" href="deadlock-stats.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🎮 Deadlock 통계</h1>
            <p class="subtitle">캐릭터 & 아이템 랭킹 (최근 7일)</p>
            <div id="last-update" class="last-update">
                <span>📅 마지막 업데이트: 
                    <%= new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) %> (KST)
                </span>
            </div>
        </header>

        <div class="stats-grid">
            <div class="stat-card">
                <h2 class="card-title">🏆 최고 플레이 캐릭터</h2>
                <div id="most-played-section">
                    <ul class="ranking-list">
                        <c:forEach var="hero" items="${mostPlayedHeroes}" varStatus="status">
                            <li class="ranking-item">
                                <span class="rank-number">${status.index + 1}</span>
                                <div class="item-info">
                                    <div class="hero-image ${empty hero.image ? 'error' : ''}" 
                                         style="${not empty hero.image ? 'background-image: url(\'' + hero.image + '\'); background-size: cover;' : ''}">
                                        ${empty hero.image ? hero.name.substring(0,1) : ''}
                                    </div>
                                    <span class="character-name">${hero.name}</span>
                                </div>
                                <span class="stat-value"><fmt:formatNumber value="${hero.matches}" pattern="#,###"/></span>
                            </li>
                        </c:forEach>
                    </ul>
                </div>
            </div>

            <div class="stat-card">
                <h2 class="card-title">🥇 최고 승률 캐릭터</h2>
                <div id="win-rate-section">
                    <ul class="ranking-list">
                        <c:forEach var="hero" items="${bestWinRateHeroes}" varStatus="status">
                            <li class="ranking-item">
                                <span class="rank-number">${status.index + 1}</span>
                                <div class="item-info">
                                    <div class="hero-image ${empty hero.image ? 'error' : ''}" 
                                         style="${not empty hero.image ? 'background-image: url(\'' + hero.image + '\'); background-size: cover;' : ''}">
                                        ${empty hero.image ? hero.name.substring(0,1) : ''}
                                    </div>
                                    <span class="character-name">${hero.name}</span>
                                </div>
                                <span class="stat-value"><fmt:formatNumber value="${hero.winRate}" pattern="#0.0"/>%</span>
                            </li>
                        </c:forEach>
                    </ul>
                </div>
            </div>

            <div class="stat-card">
                <h2 class="card-title">⚔️ 최다 사용 아이템</h2>
                <div id="items-section">
                    <ul class="ranking-list">
                        <c:forEach var="item" items="${topItems}" varStatus="status">
                            <li class="ranking-item">
                                <span class="rank-number">${status.index + 1}</span>
                                <div class="item-info">
                                    <div class="item-image ${empty item.image ? 'error' : ''}" 
                                         style="${not empty item.image ? 'background-image: url(\'' + item.image + '\'); background-size: cover;' : ''}">
                                        ${empty item.image ? '💎' : ''}
                                    </div>
                                    <span class="item-name">${item.name}</span>
                                </div>
                                <span class="stat-value"><fmt:formatNumber value="${item.usageRate}" pattern="#0.0"/>%</span>
                            </li>
                        </c:forEach>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <script>
        console.log('=== Deadlock 통계 JSP 버전 ===');
        
        // 페이지 로드 완료 후 실행
        window.addEventListener('load', function() {
            console.log('✅ JSP 페이지 로딩 완료!');
        });
    </script>
</body>
</html>