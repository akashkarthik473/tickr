import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { marbleWhite, marbleLightGray, marbleGray, marbleDarkGray, marbleGold } from '../marblePalette';
import { fontHeading, fontBody } from '../fontPalette';

export default function Inventory() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🎒 Inventory: Fetching user data...');
      
      const userDataResponse = await api.getUserData();
      console.log('🎒 Inventory: User data received:', userDataResponse);

      setUserData(userDataResponse);
    } catch (err) {
      console.error('❌ Inventory: Error fetching data:', err);
      setError(err.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const getItemIcon = (itemType, effectType) => {
    switch (itemType) {
      case 'booster':
        return '⚡';
      case 'utility':
        switch (effectType) {
          case 'instant_xp': return '🎁';
          case 'skip_token': return '⏭️';
          case 'streak_freeze': return '🛡️';
          case 'instant_coins': return '💰';
          default: return '🔧';
        }
      default:
        return '📦';
    }
  };

  const getItemDescription = (item) => {
    switch (item.effect?.type) {
      case 'xp_multiplier':
        const bonusPercent = (item.effect.multiplier - 1) * 100;
        return `Get ${bonusPercent}% more XP for ${item.effect.lessonsRemaining} lessons`;
      case 'coin_multiplier':
        const coinBonusPercent = (item.effect.multiplier - 1) * 100;
        return `Get ${coinBonusPercent}% more coins for ${item.effect.lessonsRemaining} lessons`;
      case 'instant_xp':
        return `Instantly received ${item.effect.amount} XP`;
      case 'skip_token':
        return `Skip any lesson while maintaining progress`;
      case 'streak_freeze':
        return `Protect your learning streak for ${item.effect.days} days`;
      case 'instant_coins':
        return `Instantly received ${item.effect.amount} coins`;
      default:
        return 'Special item effect';
    }
  };

  const getItemStatus = (item) => {
    if (item.itemType === 'booster') {
      return item.active ? 'Active' : 'Expired';
    } else if (item.itemType === 'utility') {
      switch (item.effect?.type) {
        case 'skip_token':
          return `Uses: ${userData?.skipTokens || 0}`;
        case 'streak_freeze':
          return `Days: ${userData?.streakFreezes || 0}`;
        default:
          return 'Used';
      }
    }
    return 'Available';
  };

  const getStatusColor = (item) => {
    if (item.itemType === 'booster') {
      return item.active ? '#22c55e' : '#ef4444';
    } else if (item.itemType === 'utility') {
      switch (item.effect?.type) {
        case 'skip_token':
        case 'streak_freeze':
          return '#22c55e';
        default:
          return '#6b7280';
      }
    }
    return '#6b7280';
  };

  const handleUseSkipToken = () => {
    // TODO: Implement skip token usage
    alert('Skip token usage will be implemented in the lesson system!');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: marbleWhite,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: fontBody
      }}>
        <div>Loading inventory...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: marbleWhite,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
        fontFamily: fontBody
      }}>
        <div style={{ color: marbleDarkGray, fontSize: "18px" }}>❌ {error}</div>
        <button
          onClick={fetchUserData}
          style={{
            backgroundColor: marbleGold,
            color: marbleDarkGray,
            border: "none",
            padding: "12px 24px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const purchasedItems = userData?.purchasedItems || [];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: marbleWhite,
      fontFamily: fontBody
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: marbleLightGray,
        padding: "24px",
        borderBottom: `1px solid ${marbleGray}`
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: marbleDarkGray,
              fontSize: "16px",
              cursor: "pointer",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            ← Back to Dashboard
          </button>
          
          <h1 style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: marbleDarkGray,
            fontFamily: fontHeading,
            marginBottom: "8px"
          }}>
            Inventory
          </h1>
          
          <p style={{
            fontSize: "18px",
            color: marbleGray,
            marginBottom: "24px"
          }}>
            Manage your purchased items and special abilities
          </p>

          {/* Inventory Stats */}
          <div style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap"
          }}>
            <div style={{
              backgroundColor: marbleWhite,
              borderRadius: "12px",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <div style={{ fontSize: "24px" }}>⏭️</div>
              <div>
                <div style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: marbleDarkGray
                }}>
                  {userData?.skipTokens || 0}
                </div>
                <div style={{
                  fontSize: "14px",
                  color: marbleGray
                }}>
                  Skip Tokens
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: marbleWhite,
              borderRadius: "12px",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <div style={{ fontSize: "24px" }}>🛡️</div>
              <div>
                <div style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: marbleDarkGray
                }}>
                  {userData?.streakFreezes || 0}
                </div>
                <div style={{
                  fontSize: "14px",
                  color: marbleGray
                }}>
                  Streak Freeze Days
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "48px 24px"
      }}>
        {/* Items Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px"
        }}>
          {purchasedItems.length === 0 ? (
            <div style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "48px",
              color: marbleGray
            }}>
              <div style={{
                fontSize: "48px",
                marginBottom: "16px"
              }}>
                🎒
              </div>
              <h3 style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: marbleDarkGray,
                marginBottom: "8px"
              }}>
                No items in inventory
              </h3>
              <p>Visit the shop to purchase items and they'll appear here.</p>
              <button
                onClick={() => navigate('/shop')}
                style={{
                  backgroundColor: marbleGold,
                  color: marbleDarkGray,
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginTop: "16px"
                }}
              >
                Go to Shop
              </button>
            </div>
          ) : (
            purchasedItems.map((item, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: marbleLightGray,
                  borderRadius: "20px",
                  padding: "24px",
                  border: `2px solid ${marbleGray}`,
                  position: "relative"
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "16px"
                }}>
                  <div style={{
                    fontSize: "32px",
                    marginRight: "16px"
                  }}>
                    {getItemIcon(item.itemType, item.effect?.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: marbleDarkGray,
                      marginBottom: "4px"
                    }}>
                      {item.itemName}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: marbleGray,
                      fontWeight: "600",
                      textTransform: "uppercase"
                    }}>
                      {item.itemType}
                    </div>
                  </div>
                </div>

                <p style={{
                  fontSize: "14px",
                  color: marbleGray,
                  marginBottom: "20px",
                  lineHeight: "1.5"
                }}>
                  {getItemDescription(item)}
                </p>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}>
                  <div style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: getStatusColor(item)
                  }}>
                    {getItemStatus(item)}
                  </div>

                  {item.effect?.type === 'skip_token' && (userData?.skipTokens || 0) > 0 && (
                    <button
                      onClick={handleUseSkipToken}
                      style={{
                        backgroundColor: marbleGold,
                        color: marbleDarkGray,
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Use Token
                    </button>
                  )}
                </div>

                <div style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  fontSize: "12px",
                  color: marbleGray
                }}>
                  {new Date(item.purchasedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
