window.CubePathLevelGenerator = {
  getCampaignConfig(levelIndex) {
    return {
      width: 18,
      height: 18,
      pathLength: Math.min(34 + levelIndex * 4, 82),
      extraBranches: Math.min(3 + Math.floor(levelIndex / 2), 10),
      widenChance: Math.min(0.28 + levelIndex * 0.01, 0.48),

      fragileCount: Math.min(2 + Math.floor(levelIndex / 3), 7),
      solidCount: Math.min(1 + Math.floor(levelIndex / 4), 5),
      coinCount: Math.min(1 + Math.floor(levelIndex / 4), 3),
      iceCount: Math.min(1 + Math.floor(levelIndex / 3), 5),
      deadlyCount: Math.min(Math.floor(levelIndex / 4), 4),
      quicksandCount: Math.min(1 + Math.floor(levelIndex / 5), 5),
      heatCount: Math.min(1 + Math.floor(levelIndex / 5), 5),
      switchCount: Math.min(1 + Math.floor(levelIndex / 8), 2),
      gateCount: Math.min(3 + Math.floor(levelIndex / 4), 8),
      blockCount: Math.min(2 + Math.floor(levelIndex / 3), 7)
    };
  },
  placeIceOnMainPath(grid, candidates, count, mainPathSet, rng) {
    const shuffled = this.shuffleWithRng(candidates, rng);
    let placed = 0;

    for (const p of shuffled) {
      if (placed >= count) break;
      if (!mainPathSet.has(`${p.x},${p.y}`)) continue;
      if (grid[p.y][p.x] !== 1) continue;

      grid[p.y][p.x] = 9;
      placed++;
    }
  },
  placeHeatOnMainPath(grid, candidates, count, mainPathSet, rng) {
    const shuffled = this.shuffleWithRng(candidates, rng);
    let placed = 0;

    for (const p of shuffled) {
      if (placed >= count) break;
      if (!mainPathSet.has(`${p.x},${p.y}`)) continue;
      if (grid[p.y][p.x] !== 1) continue;

      grid[p.y][p.x] = 11;
      placed++;
    }
  },
  createSeededRandom(seed) {
    let value = seed % 2147483647;
    if (value <= 0) value += 2147483646;

    return () => {
      value = (value * 16807) % 2147483647;
      return (value - 1) / 2147483646;
    };
  },

  shuffleWithRng(array, rng) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  pickRandom(array, rng) {
    if (!array.length) return null;
    return array[Math.floor(rng() * array.length)];
  },

  generateCampaignLevel(levelIndex, seed = null) {
    const config = this.getCampaignConfig(levelIndex);
    const rng = this.createSeededRandom(seed ?? (1000 + levelIndex));
    const width = config.width;
    const height = config.height;

    const grid = Array.from({ length: height }, () => Array(width).fill(0));

    const start = { x: 2, y: 2 };
    const path = this.buildMainPath(width, height, start, config.pathLength, rng);
    const mainPathSet = new Set(path.map(p => `${p.x},${p.y}`));

    for (const p of path) {
      grid[p.y][p.x] = 1;
    }

    const finish = path[path.length - 1];
    grid[start.y][start.x] = 2;
    grid[finish.y][finish.x] = 3;

    this.expandPathWidth(grid, path, config.widenChance, rng);
    this.addBranches(grid, path, config.extraBranches, rng);
    this.placeSpecialTiles(grid, path, mainPathSet, config, rng, levelIndex);

    grid[start.y][start.x] = 2;
    grid[finish.y][finish.x] = 3;

    return grid;
  },

  buildMainPath(width, height, start, targetLength, rng) {
    let bestPath = [{ x: start.x, y: start.y }];

    for (let attempt = 0; attempt < 32; attempt++) {
      const path = [{ x: start.x, y: start.y }];
      const visited = new Set([`${start.x},${start.y}`]);
      let current = { ...start };
      let stepsWithoutMove = 0;

      while (path.length < targetLength && stepsWithoutMove < 30) {
        const dirs = this.shuffleWithRng([
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 0, y: -1 }
        ], rng);

        let moved = false;
        let bestCandidate = null;
        let bestScore = -Infinity;

        for (const dir of dirs) {
          const nx = current.x + dir.x;
          const ny = current.y + dir.y;

          if (nx < 1 || ny < 1 || nx >= width - 1 || ny >= height - 1) continue;
          if (visited.has(`${nx},${ny}`)) continue;
          if (this.countVisitedNeighbors(nx, ny, visited) > 1) continue;

          const forwardBias = nx + ny;
          const edgePenalty =
            (nx <= 1 || ny <= 1 || nx >= width - 2 || ny >= height - 2) ? -4 : 0;

          const score = forwardBias + edgePenalty + rng() * 3;

          if (score > bestScore) {
            bestScore = score;
            bestCandidate = { x: nx, y: ny };
          }
        }

        if (!bestCandidate) {
          stepsWithoutMove++;
          break;
        }

        current = bestCandidate;
        path.push(current);
        visited.add(`${current.x},${current.y}`);
        stepsWithoutMove = 0;
        moved = true;

        if (!moved) break;
      }

      if (path.length > bestPath.length) {
        bestPath = path;
      }
    }

    return bestPath;
  },

  countVisitedNeighbors(x, y, visited) {
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ];

    let count = 0;
    for (const d of dirs) {
      if (visited.has(`${x + d.x},${y + d.y}`)) count++;
    }
    return count;
  },

  expandPathWidth(grid, path, chance, rng) {
    for (let i = 1; i < path.length - 1; i++) {
      if (rng() > chance) continue;

      const prev = path[i - 1];
      const cur = path[i];
      const next = path[i + 1];

      const dir1 = { x: cur.x - prev.x, y: cur.y - prev.y };
      const dir2 = { x: next.x - cur.x, y: next.y - cur.y };

      const perpendiculars = [];

      if (dir1.x !== 0 || dir2.x !== 0) {
        perpendiculars.push({ x: 0, y: 1 }, { x: 0, y: -1 });
      }
      if (dir1.y !== 0 || dir2.y !== 0) {
        perpendiculars.push({ x: 1, y: 0 }, { x: -1, y: 0 });
      }

      const dirs = this.shuffleWithRng(perpendiculars, rng);

      for (const d of dirs) {
        const nx = cur.x + d.x;
        const ny = cur.y + d.y;

        if (!this.isInsideGrid(grid, nx, ny)) continue;
        if (grid[ny][nx] !== 0) continue;

        grid[ny][nx] = 1;

        if (rng() < 0.22) {
          const nx2 = nx + d.x;
          const ny2 = ny + d.y;
          if (this.isInsideGrid(grid, nx2, ny2) && grid[ny2][nx2] === 0) {
            grid[ny2][nx2] = 1;
          }
        }
        break;
      }
    }
  },

  addBranches(grid, path, count, rng) {
    const roots = this.shuffleWithRng(path.slice(3, path.length - 3), rng);

    let placed = 0;
    for (const root of roots) {
      if (placed >= count) break;

      const dirs = this.shuffleWithRng([
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
      ], rng);

      for (const d of dirs) {
        const branchLength = 2 + Math.floor(rng() * 3);

        let cx = root.x;
        let cy = root.y;
        const newCells = [];
        let valid = true;

        for (let step = 0; step < branchLength; step++) {
          cx += d.x;
          cy += d.y;

          if (!this.isInsideGrid(grid, cx, cy)) {
            valid = false;
            break;
          }

          if (grid[cy][cx] !== 0) {
            valid = false;
            break;
          }

          newCells.push({ x: cx, y: cy });
        }

        if (!valid || newCells.length < 2) continue;

        for (const cell of newCells) {
          grid[cell.y][cell.x] = 1;
        }

        placed++;
        break;
      }
    }
  },
  placeSwitchesOnMainPath(grid, candidates, count, mainPathSet, rng) {
    const shuffled = this.shuffleWithRng(candidates, rng);
    let placed = 0;

    for (const p of shuffled) {
      if (placed >= count) break;
      if (!mainPathSet.has(`${p.x},${p.y}`)) continue;
      if (grid[p.y][p.x] !== 1) continue;

      grid[p.y][p.x] = 12;
      placed++;
    }
  },

  placeOpenGatesOnSideTiles(grid, candidates, count, rng) {
    const shuffled = this.shuffleWithRng(candidates, rng);
    let placed = 0;

    for (const p of shuffled) {
      if (placed >= count) break;
      if (grid[p.y][p.x] !== 1) continue;

      grid[p.y][p.x] = 13;
      placed++;
    }
  },

  placeClosedGatesOnSideTiles(grid, candidates, count, rng) {
    const shuffled = this.shuffleWithRng(candidates, rng);
    let placed = 0;

    for (const p of shuffled) {
      if (placed >= count) break;
      if (grid[p.y][p.x] !== 1) continue;

      grid[p.y][p.x] = 14;
      placed++;
    }
  },
  placeCoinsOnSideTiles(grid, candidates, count, rng) {
    const shuffled = this.shuffleWithRng(candidates, rng);
    let placed = 0;

    for (const p of shuffled) {
      if (placed >= count) break;
      if (grid[p.y][p.x] !== 1) continue;

      grid[p.y][p.x] = 8; // coin tile
      placed++;
    }
  },
  placeSpecialTiles(grid, path, mainPathSet, config, rng, levelIndex = 0) {
    const mainPathCandidates = path.slice(4, path.length - 4);
    let sideCandidates = this.collectSideCandidates(grid, mainPathSet);
    const biomeIndex = Math.floor(levelIndex / 20);

    if (biomeIndex === 1) {
      this.placeIceOnMainPath(grid, mainPathCandidates, config.iceCount, mainPathSet, rng);
    }

    if (biomeIndex === 3) {
      this.placeHeatOnMainPath(grid, mainPathCandidates, config.heatCount, mainPathSet, rng);
    }

    this.placeRandomOnMainPath(grid, mainPathCandidates, 5, config.fragileCount, mainPathSet, rng);
    this.placeRandomOnMainPath(grid, mainPathCandidates, 6, config.solidCount, mainPathSet, rng);

    this.placeCoinsOnSideTiles(grid, sideCandidates, config.coinCount, rng);
    this.placeBlocksOnSideTiles(grid, sideCandidates, config.blockCount, rng);

    sideCandidates = this.collectSideCandidates(grid, mainPathSet);

    if (biomeIndex === 2) {
      this.placeQuicksandOnSideTiles(grid, sideCandidates, config.quicksandCount, rng);
    } else {
      this.placeDeadlyOnSideTiles(grid, sideCandidates, config.deadlyCount, rng);
    }

    if (biomeIndex === 4) {
      sideCandidates = this.collectSideCandidates(grid, mainPathSet);

      this.placeSwitchesOnMainPath(grid, mainPathCandidates, config.switchCount, mainPathSet, rng);

      sideCandidates = this.collectSideCandidates(grid, mainPathSet);
      this.placeOpenGatesOnSideTiles(grid, sideCandidates, Math.ceil(config.gateCount / 2), rng);

      sideCandidates = this.collectSideCandidates(grid, mainPathSet);
      this.placeClosedGatesOnSideTiles(grid, sideCandidates, Math.floor(config.gateCount / 2), rng);
    }
  },
  placeRandomOnMainPath(grid, candidates, tileType, count, mainPathSet, rng) {
    const shuffled = this.shuffleWithRng(candidates, rng);
    let placed = 0;

    for (const p of shuffled) {
      if (placed >= count) break;
      if (!mainPathSet.has(`${p.x},${p.y}`)) continue;
      if (grid[p.y][p.x] !== 1) continue;

      grid[p.y][p.x] = tileType;
      placed++;
    }
  },

  placeBlocksOnSideTiles(grid, candidates, count, rng) {
    const shuffled = this.shuffleWithRng(candidates, rng);
    let placed = 0;

    for (const p of shuffled) {
      if (placed >= count) break;
      if (grid[p.y][p.x] !== 1) continue;

      grid[p.y][p.x] = 4;
      placed++;
    }
  },
  placeQuicksandOnSideTiles(grid, candidates, count, rng) {
    const shuffled = this.shuffleWithRng(candidates, rng);
    let placed = 0;

    for (const p of shuffled) {
      if (placed >= count) break;
      if (grid[p.y][p.x] !== 1) continue;

      grid[p.y][p.x] = 10; // quicksand
      placed++;
    }
  },
  placeDeadlyOnSideTiles(grid, candidates, count, rng) {
    const shuffled = this.shuffleWithRng(candidates, rng);
    let placed = 0;

    for (const p of shuffled) {
      if (placed >= count) break;
      if (grid[p.y][p.x] !== 1) continue;

      grid[p.y][p.x] = 7;
      placed++;
    }
  },
  collectSideCandidates(grid, mainPathSet) {
    const result = [];

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] !== 1) continue;
        if (mainPathSet.has(`${x},${y}`)) continue;

        result.push({ x, y });
      }
    }

    return result;
  },
  isInsideGrid(grid, x, y) {
    return y >= 0 && y < grid.length && x >= 0 && x < grid[y].length;
  }
};