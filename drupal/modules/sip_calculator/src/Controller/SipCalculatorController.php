<?php

namespace Drupal\sip_calculator\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Controller for the SIP Calculator page.
 *
 * Compatible: Drupal 10.5.6 | PHP 8.1
 */
class SipCalculatorController extends ControllerBase {

  /**
   * Renders the SIP Calculator page.
   *
   * @return array
   *   Drupal render array embedding the Next.js calculator.
   */
  public function index(): array {
    // URL of the running Next.js calculator
    $calculator_url = \Drupal::config('sip_calculator.settings')
      ->get('nextjs_url') ?? 'http://localhost:3000';

    return [
      '#theme'          => 'sip_calculator',
      '#calculator_url' => $calculator_url,
      '#title'          => $this->t('Goal-Based SIP Calculator'),
      '#attached'       => [
        'library' => ['sip_calculator/sip_calculator'],
      ],
      '#cache' => ['max-age' => 0],
    ];
  }

  /**
   * API proxy: forwards calculation requests to Next.js backend.
   * Allows Drupal to act as middleware if needed.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function apiProxy(): \Symfony\Component\HttpFoundation\JsonResponse {
    $request = \Drupal::request();
    $data    = json_decode($request->getContent(), TRUE) ?? [];

    // Forward to Next.js API
    $nextjs_url = \Drupal::config('sip_calculator.settings')
      ->get('nextjs_url') ?? 'http://localhost:3000';

    $client   = \Drupal::httpClient();
    try {
      $response = $client->post($nextjs_url . '/api/calculate', [
        'json'    => $data,
        'headers' => ['Content-Type' => 'application/json'],
        'timeout' => 5,
      ]);
      $body = json_decode($response->getBody()->getContents(), TRUE);
    }
    catch (\Exception $e) {
      $body = ['error' => 'Calculator service unavailable'];
    }

    return new \Symfony\Component\HttpFoundation\JsonResponse($body);
  }

}