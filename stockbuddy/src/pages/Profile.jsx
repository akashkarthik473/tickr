import React, { useState, useEffect } from 'react';
import './Profile.css';
import { api, isAuthenticated, getCurrentUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signin');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileResponse, portfolioResponse, userDataResponse] = await Promise.all([
        api.getProfile().catch(() => ({ success: false })),
        api.getPortfolio().catch(() => ({ success: false })),
        api.getUserData().catch(() => ({ success: false }))
      ]);

      if (profileResponse.success) {
        setUserProfile(profileResponse.user);
      }

      if (portfolioResponse.success) {
        setPortfolio(portfolioResponse.portfolio);
      }

      if (userDataResponse.success) {
        setUserData(userDataResponse);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="profile-page-center">
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading profile...
        </div>
      </div>
    );
  }

  const currentUser = getCurrentUser();
  const profile = userProfile || currentUser;
  const username = profile?.username || currentUser?.username || 'User';
  const name = profile?.name || currentUser?.username || 'User';
  const email = profile?.email || currentUser?.email || '';
  const picture = profile?.picture || null;
  const createdAt = profile?.createdAt || null;
  
  // Calculate portfolio values
  const totalValue = portfolio?.totalValue || portfolio?.balance || 0;
  const cash = portfolio?.balance || 0;
  const holdings = portfolio?.positions?.reduce((sum, pos) => {
    return sum + (pos.shares * (pos.currentPrice || pos.avgPrice || 0));
  }, 0) || 0;
  const crypto = 0; // Not implemented yet

  // Calculate allocation percentages
  const stocksValue = holdings;
  const totalInvested = cash + holdings;
  const stocksPercent = totalInvested > 0 ? ((stocksValue / totalInvested) * 100).toFixed(0) : 0;
  const etfsPercent = 0; // Not tracked separately
  const optionsPercent = 0; // Not implemented
  const cryptoPercent = 0; // Not implemented

  // Generate avatar if no picture
  const avatarUrl = picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=333&color=fff&size=128`;

  // Format joined date
  const joinedYear = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();

  // Determine premium status (can be based on XP or other criteria)
  const xp = userData?.learningProgress?.xp || 0;
  const isPremium = xp >= 1000; // Premium for users with 1000+ XP

  return (
    <div className="profile-page-center">
      <div className={`profile-card ${isPremium ? 'profile-card-gold' : 'profile-card-silver'}`}>
        <img src={avatarUrl} alt="avatar" className="profile-avatar" />
        <h2 className="profile-name">{name}</h2>
        <div className="profile-username">@{username} · Joined {joinedYear}</div>
        <a href="#" className="profile-edit" onClick={(e) => {
          e.preventDefault();
          navigate('/settings');
        }}>Edit profile</a>
        <div className="profile-total-value">{formatCurrency(totalValue)}</div>
        <div className="profile-total-label">Total in tickr</div>
        <div className="profile-investing-section">
          <div className="profile-investing-title">Individual investing</div>
          <div className="profile-divider"></div>
          <div className="profile-investing-row">
            <span>Total individual value</span>
            <span className="profile-investing-value">{formatCurrency(totalValue)}</span>
          </div>
          <div className="profile-investing-row">
            <span>Individual holdings</span>
            <span>{formatCurrency(holdings)}</span>
          </div>
          <div className="profile-investing-row">
            <span>Individual cash</span>
            <span>{formatCurrency(cash)}</span>
          </div>
          <div className="profile-investing-row">
            <span>Crypto holdings</span>
            <span>{formatCurrency(crypto)}</span>
          </div>
        </div>
        <div className="profile-overview-section">
          <div className="profile-overview-title">Overview</div>
          <div className="profile-overview-circles">
            <div className="profile-overview-circle profile-overview-circle-active">
              <div>Stocks</div>
              <div className="profile-overview-value">{stocksPercent}%</div>
            </div>
            <div className="profile-overview-circle">
              <div>ETFs</div>
              <div className="profile-overview-value">{etfsPercent}%</div>
            </div>
            <div className="profile-overview-circle">
              <div>Options</div>
              <div className="profile-overview-value">{optionsPercent}%</div>
            </div>
            <div className="profile-overview-circle">
              <div>Crypto</div>
              <div className="profile-overview-value">{cryptoPercent}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;