# 🐳 Balina — USDT Büyük Transfer Takip Sistemi

Ethereum ağında gerçek zamanlı olarak büyük USDT transferlerini izleyen, Telegram ve tarayıcı bildirimleri gönderen full-stack bir web uygulamasıdır.

API key gerektiren tüm işlemler merkezi sunucu üzerinden yürütülür. Projeyi clone'layan kullanıcıların herhangi bir API key ayarlamasına gerek yoktur.

---

## 🚀 Kurulum


**1. Repoyu klonlayın**
```bash
git clone https://github.com/kullanici/balina.git
cd balina
```

**2. Başlatın**

```
start.bat dosyasına çift tıklayın
```

> Tüm API key'ler merkezi sunucuda yönetilir. Başka hiçbir ayar gerekmez.

---

## 🛠 Kullanılan Teknolojiler

### Backend
| Teknoloji | Açıklama |
|-----------|----------|
| [NestJS](https://nestjs.com/) | Node.js framework |
| [Ethers.js](https://ethers.org/) | Ethereum WebSocket dinleyici |
| [Alchemy](https://www.alchemy.com/) | Ethereum RPC sağlayıcı |
| [Firebase Admin SDK](https://firebase.google.com/) | Push bildirim gönderici |
| [Telegram Bot API](https://core.telegram.org/bots/api) | Telegram grup bildirimleri |
| [PM2](https://pm2.keymetrics.io/) | Process yönetimi |

### Frontend
| Teknoloji | Açıklama |
|-----------|----------|
| [React](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Tip güvenliği |
| [Tailwind CSS](https://tailwindcss.com/) | Stil |
| [Axios](https://axios-http.com/) | HTTP istemcisi |
| [Firebase SDK](https://firebase.google.com/) | Tarayıcı push bildirimleri |

### Altyapı
| Teknoloji | Açıklama |
|-----------|----------|
| IIS | Windows web sunucusu |
| IIS URL Rewrite | API proxy katmanı |

---

## 📸 Ekran Görüntüleri

---

<img width="1168" height="937" alt="image" src="https://github.com/user-attachments/assets/60544fc8-5ab2-48a6-83fa-bac03e7fb988" />

---

## ⚙️ Nasıl Çalışır?

```
Ethereum Mainnet
      │
      ▼ WebSocket (Alchemy)
 NestJS Backend  ──────────► Telegram Grubu
      │
      ▼ REST API
 React Frontend  (8 saniyede bir güncellenir)
```

1. Backend, Alchemy WebSocket üzerinden Ethereum bloklarını dinler
2. Eşik değerini aşan transferler yakalanır (varsayılan: 100M USDT)
3. Telegram grubuna anlık bildirim gönderilir
4. Frontend, API'yi her 8 saniyede poll eder ve transferleri gösterir

---

## 📄 Lisans

MIT
