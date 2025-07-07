;; An on-chain counter that stores a count for each individual

;; Define a map data structure
(define-map counters
  principal
  uint
)

;; Function to retrieve the count for a given individual
(define-read-only (get-count (who principal))
  (default-to u0 (map-get? counters who))
)

;; Function to increment the count for the caller
(define-public (count-up)
  (begin
    (var-set total-count (+ (var-get total-count) u1))
    (ok (map-set counters tx-sender (+ (get-count tx-sender) u1)))
  )
)

;; Function to decrement the count for the caller
(define-public (count-down)
  (let ((current-count (get-count tx-sender)))
    (if (> current-count u0)
        (begin
          (var-set total-count (- (var-get total-count) u1))
          (ok (map-set counters tx-sender (- current-count u1)))
        )
        (err u1) ;; Error: Cannot go below zero
    )
  )
)

;; Function to reset the count for the caller to zero
(define-public (reset-count)
  (let ((current-count (get-count tx-sender)))
    (begin
      (var-set total-count (- (var-get total-count) current-count))
      (ok (map-set counters tx-sender u0))
    )
  )
)

;; Function to set the count for the caller to a specific value
(define-public (set-count (new-count uint))
  (let ((current-count (get-count tx-sender)))
    (begin
      (var-set total-count (+ (- (var-get total-count) current-count) new-count))
      (ok (map-set counters tx-sender new-count))
    )
  )
)

;; Global variable to track total count of all users
(define-data-var total-count uint u0)

;; Define maximum allowed count per user
(define-constant MAX-COUNT u100)

;; Function to get the global total of all counters
(define-read-only (get-global-total)
  (var-get total-count)
)

;; Function to increment the count by a custom amount
(define-public (count-up-by (amount uint))
  (begin
    (var-set total-count (+ (var-get total-count) amount))
    (ok (map-set counters tx-sender (+ (get-count tx-sender) amount)))
  )
)

;; Function to decrement the count by a custom amount
(define-public (count-down-by (amount uint))
  (let ((current-count (get-count tx-sender)))
    (if (>= current-count amount)
        (begin
          (var-set total-count (- (var-get total-count) amount))
          (ok (map-set counters tx-sender (- current-count amount)))
        )
        (err u2) ;; Error: Insufficient count to decrement by this amount
    )
  )
)
