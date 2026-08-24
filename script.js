import { createClient } from "@supabase/supabase-js";

const PASSWORD = document.body.dataset.password || "0518";
const titleText = document.body.dataset.titleText || "罗世璨生日快乐";
const englishTitle = document.body.dataset.englishTitle ?? "HAPPY BIRTHDAY LUOSHICAN";
const autoStart = document.body.dataset.autoStart === "true";
const cakeBurstEnabled = document.body.dataset.disableCakeBurst !== "true";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "birthday-photos";
const WALL_ID = document.body.dataset.wallId || import.meta.env.VITE_WALL_ID || "lsc-birthday-wall";
const LOCAL_NOTES_KEY = document.body.dataset.notesKey || "birthdayNotes";
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const intro = document.querySelector("#intro");
const passwordCard = document.querySelector("#passwordCard");
const passwordInput = document.querySelector("#passwordInput");
const unlockButton = document.querySelector("#unlockButton");
const hint = document.querySelector("#hint");
const cakeEmoji = document.querySelector("#cakeEmoji");
const cakeBurst = document.querySelector("#cakeBurst");
const entryLine = document.querySelector("#entryLine");
const birthdayTitle = document.querySelector("#birthdayTitle");
const fireworksCanvas = document.querySelector("#fireworksCanvas");
const blackout = document.querySelector("#blackout");
const photoWall = document.querySelector("#photoWall");
const orbitSpace = document.querySelector("#orbitSpace");
const bgMusic = document.querySelector("#bgMusic");
const volumeSlider = document.querySelector("#volumeSlider");
const volumeTrack = document.querySelector("#volumeTrack");
const centerBubble = document.querySelector("#centerBubble");
const centerPhoto = document.querySelector("#centerPhoto");
const centerUpload = document.querySelector("#centerUpload");
const orbitUpload = document.querySelector("#orbitUpload");
const bubblePhotoUpload = document.querySelector("#bubblePhotoUpload");
const sparkleCanvas = document.querySelector("#sparkleCanvas");
const addBubbleButton = document.querySelector("#addBubbleButton");
const deleteBubbleButton = document.querySelector("#deleteBubbleButton");
const chooserOpen = document.querySelector("#chooserOpen");
const notesOpen = document.querySelector("#notesOpen");
const chooserModal = document.querySelector("#chooserModal");
const resultModal = document.querySelector("#resultModal");
const notesModal = document.querySelector("#notesModal");
const confirmModal = document.querySelector("#confirmModal");
const cropModal = document.querySelector("#cropModal");
const choiceCount = document.querySelector("#choiceCount");
const choiceList = document.querySelector("#choiceList");
const decisionWheel = document.querySelector("#decisionWheel");
const spinButton = document.querySelector("#spinButton");
const resultText = document.querySelector("#resultText");
const noteInput = document.querySelector("#noteInput");
const saveNoteButton = document.querySelector("#saveNoteButton");
const noteArchive = document.querySelector("#noteArchive");
const cancelConfirmButton = document.querySelector("#cancelConfirmButton");
const confirmDeleteButton = document.querySelector("#confirmDeleteButton");
const modeToast = document.querySelector("#modeToast");
const modeToastClose = document.querySelector("#modeToastClose");
const cropCanvas = document.querySelector("#cropCanvas");
const cropZoom = document.querySelector("#cropZoom");
const cropConfirmButton = document.querySelector("#cropConfirmButton");
const cropCancelButton = document.querySelector("#cropCancelButton");

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

let introRunning = false;
let fireworksRunning = false;
let sparkleRunning = true;
let pointer = { x: -1000, y: -1000 };
let bubbles = [];
let wheelRotation = 0;
let choiceValues = ["吃好吃的", "出去玩"];
let fallbackNotes = [];
let pendingBubbleForPhoto = null;
let deleteMode = false;
let pendingNoteDeleteId = null;
let musicStarted = false;
let cropState = null;
let wallStarted = false;
let savedPhotosReady = Promise.resolve();

const choiceColors = [
  "#ff8fab",
  "#8df7d2",
  "#ffd166",
  "#9d7cff",
  "#6ee7f9",
  "#c8ff8d",
  "#ffb86b",
  "#f7a8ff",
];

function setCanvasSize(canvas) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return ctx;
}

function setVolume(value) {
  const volume = Math.min(Math.max(Number(value), 0), 100);
  if (volumeSlider) volumeSlider.value = String(volume);
  if (volumeTrack) {
    volumeTrack.style.setProperty("--volume", volume);
    volumeTrack.setAttribute("aria-valuenow", String(Math.round(volume)));
  }
  if (bgMusic) bgMusic.volume = volume / 100;
}

function setVolumeFromPointer(event) {
  if (!volumeTrack) return;
  const rect = volumeTrack.getBoundingClientRect();
  const raw = rect.width > rect.height
    ? ((event.clientX - rect.left) / rect.width) * 100
    : 100 - ((event.clientY - rect.top) / rect.height) * 100;
  setVolume(raw);
}

function checkPassword() {
  if (introRunning) return;

  if (passwordInput.value === PASSWORD) {
    introRunning = true;
    startMusic();
    runIntro();
    return;
  }

  hint.textContent = "还没打开，再试一次。";
  passwordCard.classList.remove("shake");
  void passwordCard.offsetWidth;
  passwordCard.classList.add("shake");
  passwordInput.select();
}

function startMusic() {
  if (!bgMusic || musicStarted) return;
  setVolume(volumeSlider.value);
  bgMusic.play().then(() => {
    musicStarted = true;
  }).catch(() => {
    const retryPlay = () => {
      bgMusic.play().then(() => {
        musicStarted = true;
      }).catch(() => {});
      window.removeEventListener("click", retryPlay);
      window.removeEventListener("keydown", retryPlay);
    };
    window.addEventListener("click", retryPlay, { once: true });
    window.addEventListener("keydown", retryPlay, { once: true });
  });
}

async function runIntro() {
  passwordCard?.classList.add("success");
  await wait(520);
  cakeEmoji?.classList.add("show");
  await wait(1450);
  cakeEmoji?.classList.remove("show");
  cakeEmoji?.classList.add("shrink");
  await wait(1120);
  if (cakeBurstEnabled) explodeCakes();
  await wait(680);
  revealTitle();
  await wait(titleText.length * 190 + 1700);
  entryLine.classList.add("visible");
  runFireworks(5200);
  await wait(5300);
  blackout.classList.add("on");
  await wait(1700);
  photoWall.classList.add("visible");
  intro.classList.add("hidden");
  await wait(300);
  blackout.classList.remove("on");
  startWall();
}

function explodeCakes() {
  cakeBurst.textContent = "";
  const count = window.innerWidth < 680 ? 90 : 150;

  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.max(window.innerWidth, window.innerHeight) * (0.28 + Math.random() * 0.74);
    piece.className = "burst-cake";
    piece.textContent = "🎂";
    piece.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
    piece.style.setProperty("--scale", `${0.7 + Math.random() * 2.6}`);
    piece.style.setProperty("--rot", `${-420 + Math.random() * 840}deg`);
    piece.style.animationDelay = `${Math.random() * 0.16}s`;
    piece.style.left = `${48 + Math.random() * 4}%`;
    piece.style.top = `${48 + Math.random() * 4}%`;
    cakeBurst.appendChild(piece);
  }
}

function revealTitle() {
  birthdayTitle.textContent = "";
  const titleLine = document.createElement("span");
  titleLine.className = "title-line";
  birthdayTitle.append(titleLine);

  let subtitle = null;
  if (englishTitle) {
    subtitle = document.createElement("span");
    subtitle.className = "birthday-subtitle";
    subtitle.textContent = englishTitle;
    birthdayTitle.append(subtitle);
  }

  [...titleText].forEach((letter, index) => {
    const span = document.createElement("span");
    span.className = "title-glyph";
    span.textContent = letter;
    span.dataset.letter = letter;
    span.style.setProperty("--trail-delay", `${index * 42}ms`);
    titleLine.appendChild(span);
    window.setTimeout(() => span.classList.add("visible"), index * 190);
  });
  if (subtitle) {
    window.setTimeout(() => subtitle.classList.add("visible"), titleText.length * 190 + 420);
  }
}

function runFireworks(duration) {
  const ctx = setCanvasSize(fireworksCanvas);
  const particles = [];
  const colors = ["#ffd166", "#ff5d8f", "#8df7d2", "#9d7cff", "#ffffff"];
  const startedAt = performance.now();
  let nextBurst = 0;
  fireworksRunning = true;

  function burst() {
    const edge = Math.floor(Math.random() * 4);
    const padding = 46;
    let x = padding + Math.random() * (window.innerWidth - padding * 2);
    let y = padding + Math.random() * (window.innerHeight - padding * 2);

    if (edge === 0) y = padding + Math.random() * 90;
    if (edge === 1) x = window.innerWidth - padding - Math.random() * 90;
    if (edge === 2) y = window.innerHeight - padding - Math.random() * 90;
    if (edge === 3) x = padding + Math.random() * 90;

    for (let i = 0; i < 42; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.6 + Math.random() * 5.2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 62 + Math.random() * 28,
        maxLife: 90,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  function draw(now) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = "lighter";

    if (now > nextBurst && now - startedAt < duration) {
      burst();
      nextBurst = now + 220 + Math.random() * 220;
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.035;
      p.vx *= 0.988;
      p.vy *= 0.988;
      p.life -= 1;

      const alpha = Math.max(p.life / p.maxLife, 0);
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.arc(p.x, p.y, 2.1 + alpha * 2.4, 0, Math.PI * 2);
      ctx.fill();

      if (p.life <= 0) particles.splice(i, 1);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    if (now - startedAt < duration + 900 || particles.length) {
      requestAnimationFrame(draw);
    } else {
      fireworksRunning = false;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  requestAnimationFrame(draw);
}

function makeBubble(src, index, options = {}) {
  const bubble = document.createElement("article");
  const frame = document.createElement("div");
  const img = document.createElement("img");
  const deleteButton = document.createElement("button");
  const placeholder = document.createElement("span");
  const isMobile = window.innerWidth <= 680;
  const size = isMobile ? 62 + Math.random() * 42 : 88 + Math.random() * 84;
  const angle = index * 0.82 + Math.random() * 0.55;
  const radius = Math.min(window.innerWidth, window.innerHeight) * (0.24 + Math.random() * 0.28);
  const centerRect = centerBubble.getBoundingClientRect();
  const centerX = centerRect.left + centerRect.width / 2;
  const centerY = centerRect.top + centerRect.height / 2;

  bubble.className = "photo-bubble orbit-bubble";
  bubble.style.setProperty("--size", `${size}px`);
  frame.className = "photo-frame";
  if (src) img.src = src;
  img.alt = "生日照片";
  placeholder.textContent = options.placeholder || "上传照片";
  deleteButton.className = "delete-bubble";
  deleteButton.type = "button";
  deleteButton.textContent = "×";
  deleteButton.setAttribute("aria-label", "移除这个气泡");
  frame.appendChild(img);
  frame.appendChild(placeholder);
  bubble.appendChild(deleteButton);
  bubble.appendChild(frame);
  orbitSpace.appendChild(bubble);

  const targetX = window.innerWidth / 2 + Math.cos(angle) * radius;
  const targetY = window.innerHeight / 2 + Math.sin(angle) * radius;
  const data = {
    el: bubble,
    x: options.fromCenter ? centerX : targetX,
    y: options.fromCenter ? centerY : targetY,
    targetX,
    targetY,
    vx: options.fromCenter ? (targetX - centerX) / 90 : (Math.random() - 0.5) * 0.6,
    vy: options.fromCenter ? (targetY - centerY) / 90 : (Math.random() - 0.5) * 0.6,
    base: size,
    size,
    phase: Math.random() * Math.PI * 2,
    hover: false,
    recordId: options.recordId || null,
    storagePath: options.storagePath || "",
    isPersisted: Boolean(options.recordId),
  };

  bubble.addEventListener("click", (event) => {
    if (event.target === deleteButton) return;
    if (deleteMode) {
      bubble.classList.add("delete-ready");
      return;
    }
    pendingBubbleForPhoto = data;
    bubblePhotoUpload.click();
  });

  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    burstBubble(data);
  });

  if (options.fromCenter) {
    bubble.classList.add("cell-born");
    window.setTimeout(() => {
      bubble.classList.remove("cell-born");
    }, 60);
  }

  return data;
}

function rebalanceBubbleTargets() {
  if (!bubbles.length) return;

  const centerRect = centerBubble.getBoundingClientRect();
  const centerX = centerRect.left + centerRect.width / 2;
  const centerY = centerRect.top + centerRect.height / 2;
  const count = bubbles.length;
  const shortest = Math.min(window.innerWidth, window.innerHeight);
  const isMobile = window.innerWidth <= 680;
  const baseRadius = isMobile
    ? Math.max(centerRect.width * 0.88, shortest * 0.3)
    : Math.max(centerRect.width * 0.82, shortest * 0.27);
  const ringGap = isMobile ? Math.max(84, shortest * 0.16) : Math.max(118, shortest * 0.18);
  const startAngle = -Math.PI / 2;

  bubbles.forEach((bubble, index) => {
    const ring = Math.floor(index / 8);
    const itemsInRing = Math.min(8, count - ring * 8);
    const indexInRing = index - ring * 8;
    const angle = startAngle + (Math.PI * 2 * indexInRing) / itemsInRing + ring * 0.34;
    const radius = baseRadius + ring * ringGap;
    const margin = bubble.base * 0.72 + 28;

    bubble.targetX = Math.min(
      Math.max(centerX + Math.cos(angle) * radius, margin),
      window.innerWidth - margin,
    );
    bubble.targetY = Math.min(
      Math.max(centerY + Math.sin(angle) * radius, margin),
      window.innerHeight - margin,
    );
  });
}

function seedDemoBubbles() {
  const gradients = [
    "linear-gradient(135deg,#ff5d8f,#ffd166)",
    "linear-gradient(135deg,#8df7d2,#9d7cff)",
    "linear-gradient(135deg,#fff1a8,#ff8fab)",
    "linear-gradient(135deg,#6ee7f9,#c8ff8d)",
    "linear-gradient(135deg,#ffffff,#ff8fab)",
    "linear-gradient(135deg,#ffd166,#8df7d2)",
    "linear-gradient(135deg,#ff9fba,#88d8ff)",
    "linear-gradient(135deg,#d8ff7a,#ffcc70)",
  ];

  bubbles = gradients.map((gradient, index) => {
    const bubble = makeBubble("", index);
    const frame = bubble.el.querySelector(".photo-frame");
    const img = bubble.el.querySelector("img");
    img.removeAttribute("src");
    frame.style.background = `${gradient}`;
    const label = frame.querySelector("span");
    label.textContent = "照片";
    return bubble;
  });
  rebalanceBubbleTargets();
}

function startWall() {
  if (wallStarted) return;
  wallStarted = true;
  savedPhotosReady.finally(() => {
    if (!bubbles.length) seedDemoBubbles();
    animateBubbles();
    drawSparkles();
  });
}

function animateBubbles() {
  const bounds = {
    left: 42,
    right: window.innerWidth - 42,
    top: 42,
    bottom: window.innerHeight - 42,
  };

  const centerRect = centerBubble.getBoundingClientRect();
  const center = {
    x: centerRect.left + centerRect.width / 2,
    y: centerRect.top + centerRect.height / 2,
    radius: centerRect.width * 0.54,
  };

  bubbles.forEach((bubble, index) => {
    if (deleteMode) {
      bubble.vx = 0;
      bubble.vy = 0;
      bubble.el.style.left = `${bubble.x}px`;
      bubble.el.style.top = `${bubble.y}px`;
      bubble.el.style.width = `${bubble.size}px`;
      bubble.el.style.height = `${bubble.size}px`;
      return;
    }

    const dxMouse = bubble.x - pointer.x;
    const dyMouse = bubble.y - pointer.y;
    const mouseDistance = Math.hypot(dxMouse, dyMouse);
    bubble.hover = mouseDistance < bubble.size * 0.65;
    const targetSize = bubble.base * (bubble.hover ? 1.48 : 1);
    bubble.size += (targetSize - bubble.size) * 0.14;

    bubble.vx += (bubble.targetX - bubble.x) * 0.0012;
    bubble.vy += (bubble.targetY - bubble.y) * 0.0012;
    bubble.vx += Math.sin(performance.now() / 1300 + bubble.phase) * 0.006;
    bubble.vy += Math.cos(performance.now() / 1500 + bubble.phase) * 0.006;

    const dxCenter = bubble.x - center.x;
    const dyCenter = bubble.y - center.y;
    const centerDistance = Math.hypot(dxCenter, dyCenter);
    const minCenterDistance = center.radius + bubble.size * 0.58;
    if (centerDistance > 0.001 && centerDistance < minCenterDistance) {
      const force = (minCenterDistance - centerDistance) / minCenterDistance;
      bubble.vx += (dxCenter / centerDistance) * force * 0.34;
      bubble.vy += (dyCenter / centerDistance) * force * 0.34;
    }

    bubbles.forEach((other, otherIndex) => {
      if (index >= otherIndex) return;
      const dx = other.x - bubble.x;
      const dy = other.y - bubble.y;
      const distance = Math.max(Math.hypot(dx, dy), 0.001);
      const minDistance = (bubble.size + other.size) * 0.48;
      if (distance < minDistance) {
        const push = (minDistance - distance) / minDistance;
        const nx = dx / distance;
        const ny = dy / distance;
        bubble.vx -= nx * push * 0.16;
        bubble.vy -= ny * push * 0.16;
        other.vx += nx * push * 0.16;
        other.vy += ny * push * 0.16;
      }
    });

    if (mouseDistance > 0.001 && mouseDistance < bubble.size * 2.2) {
      const push = (bubble.size * 2.2 - mouseDistance) / (bubble.size * 2.2);
      bubble.vx += (dxMouse / mouseDistance) * push * 0.42;
      bubble.vy += (dyMouse / mouseDistance) * push * 0.42;
    }

    bubble.x += bubble.vx;
    bubble.y += bubble.vy;
    bubble.vx *= 0.965;
    bubble.vy *= 0.965;

    if (bubble.x < bounds.left) bubble.vx += 0.45;
    if (bubble.x > bounds.right) bubble.vx -= 0.45;
    if (bubble.y < bounds.top) bubble.vy += 0.45;
    if (bubble.y > bounds.bottom) bubble.vy -= 0.45;

    bubble.x = Math.min(Math.max(bubble.x, bounds.left), bounds.right);
    bubble.y = Math.min(Math.max(bubble.y, bounds.top), bounds.bottom);
    bubble.el.style.left = `${bubble.x}px`;
    bubble.el.style.top = `${bubble.y}px`;
    bubble.el.style.width = `${bubble.size}px`;
    bubble.el.style.height = `${bubble.size}px`;
  });

  requestAnimationFrame(animateBubbles);
}

function drawSparkles() {
  const ctx = setCanvasSize(sparkleCanvas);
  const dots = Array.from({ length: 90 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 0.7 + Math.random() * 2.1,
    phase: Math.random() * Math.PI * 2,
    speed: 0.002 + Math.random() * 0.006,
  }));

  function draw(now) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    dots.forEach((dot) => {
      const alpha = 0.18 + Math.sin(now * dot.speed + dot.phase) * 0.16;
      ctx.beginPath();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#fff";
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (sparkleRunning) requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

function readImages(files, callback) {
  [...files].forEach((file) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl) {
  const [meta, data] = dataUrl.split(",");
  const mime = meta.match(/data:(.*);base64/)?.[1] || "image/png";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

async function uploadPhoto(dataUrl, kind) {
  if (!supabase) return { publicUrl: dataUrl, storagePath: "" };
  const blob = dataUrlToBlob(dataUrl);
  const storagePath = `${WALL_ID}/${kind}-${Date.now()}-${crypto.randomUUID()}.png`;
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(storagePath, blob, {
    cacheControl: "31536000",
    contentType: "image/png",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
}

async function removeStoredPhoto(storagePath) {
  if (!supabase || !storagePath) return;
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove([storagePath]);
  if (error) console.warn("Failed to remove stored photo:", error.message);
}

async function persistCenterPhoto(dataUrl) {
  if (!supabase) return;
  const { data: oldRows, error: oldRowsError } = await supabase
    .from("birthday_photos")
    .select("id, storage_path")
    .eq("wall_id", WALL_ID)
    .eq("kind", "center");
  if (oldRowsError) console.warn("Could not read previous center photo records:", oldRowsError.message);
  const { publicUrl, storagePath } = await uploadPhoto(dataUrl, "center");
  centerPhoto.src = publicUrl;

  const { error: deleteError } = await supabase
    .from("birthday_photos")
    .delete()
    .eq("wall_id", WALL_ID)
    .eq("kind", "center");
  if (deleteError) throw deleteError;
  await Promise.all((oldRows || []).map((row) => removeStoredPhoto(row.storage_path)));
  const { error: insertError } = await supabase.from("birthday_photos").insert({
    wall_id: WALL_ID,
    kind: "center",
    url: publicUrl,
    storage_path: storagePath,
    sort_order: 0,
  });
  if (insertError) throw insertError;
}

async function persistBubblePhoto(bubble, dataUrl) {
  if (!bubble || !supabase) return;
  const previousPath = bubble.storagePath;
  const { publicUrl, storagePath } = await uploadPhoto(dataUrl, "orbit");

  if (bubble.recordId) {
    const { error } = await supabase
      .from("birthday_photos")
      .update({ url: publicUrl, storage_path: storagePath })
      .eq("id", bubble.recordId);
    if (error) throw error;
    await removeStoredPhoto(previousPath);
  } else {
    const { data, error } = await supabase
      .from("birthday_photos")
      .insert({
        wall_id: WALL_ID,
        kind: "orbit",
        url: publicUrl,
        storage_path: storagePath,
        sort_order: bubbles.indexOf(bubble),
      })
      .select("id")
      .single();
    if (error) throw error;
    bubble.recordId = data?.id || null;
    bubble.isPersisted = Boolean(bubble.recordId);
  }

  bubble.storagePath = storagePath;
  setBubblePhoto(bubble, publicUrl);
}

async function deletePersistedBubble(bubble) {
  if (!supabase || !bubble?.recordId) return;
  const { error } = await supabase.from("birthday_photos").delete().eq("id", bubble.recordId);
  if (error) throw error;
  await removeStoredPhoto(bubble.storagePath);
}

async function loadPhotosFromStorage(existingPaths = new Set()) {
  if (!supabase) return 0;
  const { data, error } = await supabase.storage.from(SUPABASE_BUCKET).list(WALL_ID, {
    limit: 200,
    sortBy: { column: "name", order: "asc" },
  });
  if (error || !data) {
    if (error) console.warn("Could not list saved photos from storage:", error.message);
    return 0;
  }

  const photoFiles = data
    .filter((file) => /\.(png|jpe?g|webp|gif)$/i.test(file.name))
    .map((file) => {
      const storagePath = `${WALL_ID}/${file.name}`;
      const { data: urlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(storagePath);
      return {
        name: file.name,
        url: urlData.publicUrl,
        storagePath,
      };
    });

  const centerFiles = photoFiles.filter((file) => file.name.startsWith("center-"));
  const latestCenter = centerFiles.at(-1);
  if (latestCenter?.url) centerPhoto.src = latestCenter.url;

  let added = latestCenter ? 1 : 0;
  photoFiles
    .filter((file) => file.name.startsWith("orbit-") && !existingPaths.has(file.storagePath))
    .forEach((file, index) => {
      const bubble = makeBubble(file.url, bubbles.length + index, {
        storagePath: file.storagePath,
      });
      bubbles.push(bubble);
      added += 1;
    });

  return added;
}

async function loadSavedPhotos() {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("birthday_photos")
    .select("id, kind, url, storage_path, sort_order, created_at")
    .eq("wall_id", WALL_ID)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error || !data) {
    console.warn("Could not read photo records, falling back to storage:", error?.message);
    const addedFromStorage = await loadPhotosFromStorage();
    if (addedFromStorage) rebalanceBubbleTargets();
    return;
  }

  const center = data.filter((photo) => photo.kind === "center").at(-1);
  if (center?.url) centerPhoto.src = center.url;
  const existingPaths = new Set(data.map((photo) => photo.storage_path).filter(Boolean));

  data
    .filter((photo) => photo.kind === "orbit")
    .forEach((photo, index) => {
      const bubble = makeBubble(photo.url, index, {
        recordId: photo.id,
        storagePath: photo.storage_path,
      });
      bubbles.push(bubble);
    });
  await loadPhotosFromStorage(existingPaths);
  rebalanceBubbleTargets();
}

function openCropper(src, onConfirm) {
  const image = new Image();
  image.addEventListener("load", () => {
    const canvasSize = cropCanvas.width;
    const minScale = Math.max(canvasSize / image.width, canvasSize / image.height);
    const scale = minScale;
    cropState = {
      image,
      minScale,
      scale,
      x: (canvasSize - image.width * scale) / 2,
      y: (canvasSize - image.height * scale) / 2,
      dragging: false,
      lastX: 0,
      lastY: 0,
      onConfirm,
    };
    cropZoom.value = "100";
    drawCropPreview();
    openModal(cropModal);
  });
  image.src = src;
}

function clampCropPosition() {
  if (!cropState) return;
  const canvasSize = cropCanvas.width;
  const width = cropState.image.width * cropState.scale;
  const height = cropState.image.height * cropState.scale;
  cropState.x = Math.min(0, Math.max(canvasSize - width, cropState.x));
  cropState.y = Math.min(0, Math.max(canvasSize - height, cropState.y));
}

function drawCropPreview() {
  if (!cropState) return;
  const ctx = cropCanvas.getContext("2d");
  const size = cropCanvas.width;
  const radius = size / 2 - 12;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "rgba(6, 8, 14, 0.72)";
  ctx.fillRect(0, 0, size, size);
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(
    cropState.image,
    cropState.x,
    cropState.y,
    cropState.image.width * cropState.scale,
    cropState.image.height * cropState.scale,
  );
  ctx.restore();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
  ctx.lineWidth = 8;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.86)";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(size / 2 - radius * 0.33, size / 2 - radius * 0.4, radius * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  ctx.fill();
}

function confirmCrop() {
  if (!cropState) return;
  const outputSize = 900;
  const factor = outputSize / cropCanvas.width;
  const output = document.createElement("canvas");
  output.width = outputSize;
  output.height = outputSize;
  const ctx = output.getContext("2d");
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, outputSize, outputSize);
  ctx.drawImage(
    cropState.image,
    cropState.x * factor,
    cropState.y * factor,
    cropState.image.width * cropState.scale * factor,
    cropState.image.height * cropState.scale * factor,
  );
  const cropped = output.toDataURL("image/png");
  cropState.onConfirm(cropped);
  cropState = null;
  closeModal(cropModal);
}

function cancelCrop() {
  cropState = null;
  closeModal(cropModal);
}

function cropImageFiles(files, onEach) {
  const queue = [...files].filter((file) => file.type.startsWith("image/"));

  function next() {
    const file = queue.shift();
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      openCropper(reader.result, (cropped) => {
        onEach(cropped);
        next();
      });
    });
    reader.readAsDataURL(file);
  }

  next();
}

function addEmptyBubble() {
  const bubble = makeBubble("", bubbles.length, {
    fromCenter: true,
    placeholder: "上传照片",
  });
  const frame = bubble.el.querySelector(".photo-frame");
  const img = bubble.el.querySelector("img");
  img.removeAttribute("src");
  frame.style.background = "linear-gradient(135deg,#8df7d2,#ff8fab)";
  bubbles.push(bubble);
  rebalanceBubbleTargets();
}

function setBubblePhoto(bubble, src) {
  if (!bubble) return;
  const img = bubble.el.querySelector("img");
  img.src = src;
  bubble.el.querySelector(".photo-frame").style.background = "";
}

function toggleDeleteMode() {
  deleteMode = !deleteMode;
  photoWall.classList.toggle("delete-mode", deleteMode);
  deleteBubbleButton.textContent = deleteMode ? "解除锁定" : "删除气泡";
  bubbles.forEach((bubble) => {
    bubble.el.classList.remove("delete-ready");
    if (deleteMode) {
      bubble.vx = 0;
      bubble.vy = 0;
    }
  });

  if (deleteMode) {
    modeToast.classList.add("visible");
    modeToast.setAttribute("aria-hidden", "false");
  } else {
    modeToast.classList.remove("visible");
    modeToast.setAttribute("aria-hidden", "true");
  }
}

function burstBubble(bubble) {
  if (!bubble || bubble.el.classList.contains("popping")) return;
  deletePersistedBubble(bubble).catch(console.error);

  const rect = bubble.el.getBoundingClientRect();
  for (let i = 0; i < 26; i += 1) {
    const star = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 42 + Math.random() * 118;
    star.className = "pop-star";
    star.style.left = `${rect.left + rect.width / 2}px`;
    star.style.top = `${rect.top + rect.height / 2}px`;
    star.style.setProperty("--sx", `${Math.cos(angle) * distance}px`);
    star.style.setProperty("--sy", `${Math.sin(angle) * distance}px`);
    star.style.animationDelay = `${Math.random() * 0.16}s`;
    orbitSpace.appendChild(star);
    window.setTimeout(() => star.remove(), 1300);
  }

  bubble.el.classList.add("popping");
  bubbles = bubbles.filter((item) => item !== bubble);
  rebalanceBubbleTargets();
  window.setTimeout(() => bubble.el.remove(), 460);
}

function openModal(modal) {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function clampChoiceCount(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 2;
  return Math.min(Math.max(parsed, 2), 8);
}

function getChoiceTexts() {
  return [...choiceList.querySelectorAll("input")].map((input, index) => {
    const value = input.value.trim();
    return value || `第 ${index + 1} 个选择`;
  });
}

function renderChoiceInputs(count) {
  const currentInputs = [...choiceList.querySelectorAll("input")].map((input) => input.value);
  choiceValues = Array.from({ length: count }, (_, index) => {
    return currentInputs[index] || choiceValues[index] || `选择 ${index + 1}`;
  });

  choiceList.textContent = "";
  choiceValues.forEach((value, index) => {
    const label = document.createElement("label");
    const dot = document.createElement("span");
    const input = document.createElement("input");
    label.className = "choice-item";
    dot.className = "choice-dot";
    dot.style.setProperty("--choice-color", choiceColors[index % choiceColors.length]);
    input.value = value;
    input.placeholder = `选择 ${index + 1}`;
    input.addEventListener("input", updateWheel);
    label.append(dot, input);
    choiceList.appendChild(label);
  });

  updateWheel();
}

function updateWheel() {
  const texts = getChoiceTexts();
  const slice = 360 / texts.length;
  const stops = texts.map((_, index) => {
    const start = index * slice;
    const end = (index + 1) * slice;
    return `${choiceColors[index % choiceColors.length]} ${start}deg ${end}deg`;
  });

  decisionWheel.style.background = `conic-gradient(from -90deg, ${stops.join(", ")})`;
  decisionWheel.textContent = "";

  texts.forEach((text, index) => {
    const label = document.createElement("span");
    label.className = "wheel-label";
    label.textContent = text;
    label.style.setProperty("--angle", `${index * slice + slice / 2}deg`);
    decisionWheel.appendChild(label);
  });
}

function spinWheel() {
  const texts = getChoiceTexts();
  const selectedIndex = Math.floor(Math.random() * texts.length);
  const slice = 360 / texts.length;
  const target = 360 * 6 - (selectedIndex + 0.5) * slice;
  wheelRotation = Math.ceil(wheelRotation / 360) * 360 + target;

  spinButton.disabled = true;
  decisionWheel.style.transform = `rotate(${wheelRotation}deg)`;

  window.setTimeout(() => {
    resultText.textContent = `看来你要${texts[selectedIndex]}了呀`;
    openModal(resultModal);
    spinButton.disabled = false;
  }, 4300);
}

function readNotes() {
  try {
    fallbackNotes = JSON.parse(localStorage.getItem(LOCAL_NOTES_KEY) || "[]");
    return fallbackNotes;
  } catch {
    return fallbackNotes;
  }
}

function writeLocalNotes(notes) {
  fallbackNotes = notes;
  try {
    localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(notes));
  } catch {
    // Some file:// previews restrict storage; keep notes for this page session.
  }
}

async function getNotes() {
  if (!supabase) return readNotes();
  const { data, error } = await supabase
    .from("birthday_notes")
    .select("id, note_date, body, created_at")
    .eq("wall_id", WALL_ID)
    .order("created_at", { ascending: true });
  if (error || !data) return readNotes();
  fallbackNotes = data.map((note) => ({
    date: note.note_date || formatDate(new Date(note.created_at)),
    id: note.id,
    text: note.body,
  }));
  return fallbackNotes;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function renderNotes() {
  const notes = await getNotes();
  noteArchive.textContent = "";

  if (!notes.length) {
    const empty = document.createElement("p");
    empty.className = "archive-entry";
    empty.textContent = "还没有碎碎念，第一条就从现在开始。";
    noteArchive.appendChild(empty);
    return;
  }

  const grouped = notes.reduce((map, note) => {
    if (!map[note.date]) map[note.date] = [];
    map[note.date].push(note);
    return map;
  }, {});

  Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .forEach((date, index) => {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      const dateLabel = document.createElement("span");
      const deleteDayButton = document.createElement("button");
      details.className = "archive-day";
      details.open = index === 0;
      dateLabel.textContent = `${date} · ${grouped[date].length} 条`;
      deleteDayButton.className = "archive-delete";
      deleteDayButton.type = "button";
      deleteDayButton.textContent = "删除";
      deleteDayButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        askDeleteNote(date);
      });
      summary.append(dateLabel, deleteDayButton);
      details.appendChild(summary);

      grouped[date]
        .slice()
        .reverse()
        .forEach((note) => {
          const entry = document.createElement("p");
          entry.className = "archive-entry";
          entry.textContent = note.text;
          details.appendChild(entry);
        });

      noteArchive.appendChild(details);
    });
}

function askDeleteNote(date) {
  pendingNoteDeleteId = date;
  document.querySelector("#confirmTitle").textContent = `确定要删除 ${date} 的碎碎念吗？`;
  openModal(confirmModal);
}

async function deletePendingNotes() {
  if (!pendingNoteDeleteId) return;
  if (supabase) {
    await supabase
      .from("birthday_notes")
      .delete()
      .eq("wall_id", WALL_ID)
      .eq("note_date", pendingNoteDeleteId);
  } else {
    const notes = readNotes().filter((note) => note.date !== pendingNoteDeleteId);
    writeLocalNotes(notes);
  }
  pendingNoteDeleteId = null;
  closeModal(confirmModal);
  renderNotes();
}

async function saveNote() {
  const text = noteInput.value.trim();
  if (!text) {
    noteInput.focus();
    return;
  }

  const now = new Date();
  const noteDate = formatDate(now);
  if (supabase) {
    await supabase.from("birthday_notes").insert({
      wall_id: WALL_ID,
      note_date: noteDate,
      body: text,
    });
  } else {
    const notes = readNotes();
    notes.push({
      date: noteDate,
      id: now.toISOString(),
      text,
    });
    writeLocalNotes(notes);
  }
  noteInput.value = "";
  renderNotes();
  saveNoteButton.textContent = "已保存";
  window.setTimeout(() => {
    saveNoteButton.textContent = "保存";
  }, 1200);
}

renderChoiceInputs(2);
renderNotes();
if (volumeSlider) setVolume(volumeSlider.value);
savedPhotosReady = loadSavedPhotos().catch(console.error);

unlockButton?.addEventListener("click", checkPassword);
passwordInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") checkPassword();
});

centerBubble.addEventListener("click", () => centerUpload.click());

centerUpload.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (!file) return;
  cropImageFiles([file], (cropped) => {
    centerPhoto.src = cropped;
    persistCenterPhoto(cropped).catch(console.error);
  });
  centerUpload.value = "";
});

orbitUpload.addEventListener("change", (event) => {
  if (!event.target.files.length) return;
  cropImageFiles(event.target.files, (cropped) => {
    const bubble = makeBubble(cropped, bubbles.length);
    bubbles.push(bubble);
    rebalanceBubbleTargets();
    persistBubblePhoto(bubble, cropped).catch(console.error);
  });
  orbitUpload.value = "";
});

addBubbleButton.addEventListener("click", addEmptyBubble);
deleteBubbleButton.addEventListener("click", toggleDeleteMode);
modeToastClose.addEventListener("click", () => {
  modeToast.classList.remove("visible");
  modeToast.setAttribute("aria-hidden", "true");
});

bubblePhotoUpload.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (!file) return;
  cropImageFiles([file], (cropped) => {
    setBubblePhoto(pendingBubbleForPhoto, cropped);
    persistBubblePhoto(pendingBubbleForPhoto, cropped).catch(console.error);
    pendingBubbleForPhoto = null;
  });
  bubblePhotoUpload.value = "";
});

chooserOpen.addEventListener("click", () => openModal(chooserModal));
notesOpen.addEventListener("click", () => {
  renderNotes();
  openModal(notesModal);
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    closeModal(document.querySelector(`#${button.dataset.close}`));
  });
});

document.querySelectorAll(".tool-modal").forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target !== modal) return;
    if (modal === cropModal) {
      cancelCrop();
      return;
    }
    closeModal(modal);
  });
});

choiceCount.addEventListener("input", () => {
  if (choiceCount.value === "") return;
  const count = clampChoiceCount(choiceCount.value);
  choiceCount.value = count;
  renderChoiceInputs(count);
});

choiceCount.addEventListener("blur", () => {
  if (choiceCount.value === "") {
    choiceCount.value = 2;
    renderChoiceInputs(2);
  }
});

spinButton.addEventListener("click", spinWheel);
saveNoteButton.addEventListener("click", saveNote);
cancelConfirmButton.addEventListener("click", () => {
  pendingNoteDeleteId = null;
  closeModal(confirmModal);
});
confirmDeleteButton.addEventListener("click", deletePendingNotes);
cropConfirmButton.addEventListener("click", confirmCrop);
cropCancelButton.addEventListener("click", cancelCrop);
cropZoom.addEventListener("input", () => {
  if (!cropState) return;
  const canvasSize = cropCanvas.width;
  const oldScale = cropState.scale;
  const centerImageX = (canvasSize / 2 - cropState.x) / oldScale;
  const centerImageY = (canvasSize / 2 - cropState.y) / oldScale;
  cropState.scale = cropState.minScale * (Number(cropZoom.value) / 100);
  cropState.x = canvasSize / 2 - centerImageX * cropState.scale;
  cropState.y = canvasSize / 2 - centerImageY * cropState.scale;
  clampCropPosition();
  drawCropPreview();
});
cropCanvas.addEventListener("pointerdown", (event) => {
  if (!cropState) return;
  cropState.dragging = true;
  cropState.lastX = event.clientX;
  cropState.lastY = event.clientY;
  cropCanvas.classList.add("dragging");
  cropCanvas.setPointerCapture(event.pointerId);
});
cropCanvas.addEventListener("pointermove", (event) => {
  if (!cropState || !cropState.dragging) return;
  cropState.x += event.clientX - cropState.lastX;
  cropState.y += event.clientY - cropState.lastY;
  cropState.lastX = event.clientX;
  cropState.lastY = event.clientY;
  clampCropPosition();
  drawCropPreview();
});
cropCanvas.addEventListener("pointerup", () => {
  if (!cropState) return;
  cropState.dragging = false;
  cropCanvas.classList.remove("dragging");
});
cropCanvas.addEventListener("pointercancel", () => {
  if (!cropState) return;
  cropState.dragging = false;
  cropCanvas.classList.remove("dragging");
});
volumeSlider?.addEventListener("input", () => {
  setVolume(volumeSlider.value);
});
volumeTrack?.addEventListener("pointerdown", (event) => {
  setVolumeFromPointer(event);
  volumeTrack.setPointerCapture(event.pointerId);
});
volumeTrack?.addEventListener("pointermove", (event) => {
  if (event.buttons !== 1) return;
  setVolumeFromPointer(event);
});
volumeTrack?.addEventListener("keydown", (event) => {
  const current = Number(volumeSlider.value);
  if (event.key === "ArrowUp" || event.key === "ArrowRight") {
    event.preventDefault();
    setVolume(current + 5);
  }
  if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
    event.preventDefault();
    setVolume(current - 5);
  }
});

window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY };
});

window.addEventListener("pointerleave", () => {
  pointer = { x: -1000, y: -1000 };
});

window.addEventListener("resize", () => {
  setCanvasSize(fireworksCanvas);
  setCanvasSize(sparkleCanvas);
  rebalanceBubbleTargets();
});

window.addEventListener("load", () => {
  if (autoStart) {
    introRunning = true;
    startMusic();
    runIntro();
    return;
  }
  passwordInput?.focus();
});
